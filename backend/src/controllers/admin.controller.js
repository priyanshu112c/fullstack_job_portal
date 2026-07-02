import { getDashboardStats } from "../services/admin.service.js";
import { monthlyUsers } from "../services/admin.service.js";
import { logAuditAction, getAuditLogs, getConversationDetails, unlockConversation, deleteAuditLogs, deleteUserWithCascade } from "../services/admin.service.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Message from "../models/Message.js";
import ConversationLock from "../models/ConversationLock.js";
import { emitConversationLocked, emitConversationUnlocked, emitMessageDeleted, emitUserBlocked, emitUserUnblocked, emitConversationDeleted } from "../sockets/socket.js";

const buildConversationKey = (a, b) => {
    const [x, y] = [a?.toString(), b?.toString()].sort();
    return `${x}:${y}`;
};

export const dashboardStats = async (req, res, next) => {
    try {
        const stats = await getDashboardStats();
        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        next(error);
    }
};

export const monthlyUsersStats = async (req, res, next) => {
    try {
        const data = await monthlyUsers();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot delete their own account"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const cascadeResult = await deleteUserWithCascade(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            cascade: cascadeResult
        });
    } catch (error) {
        next(error);
    }
};

export const getAllJobsAdmin = async (req, res, next) => {
    try {
        const jobs = await Job.find().populate("recruiter", "name email");
        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        next(error);
    }
};

export const setUserBlockedStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "blocked" | "active"

        if (!["blocked", "active"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.status = status;
        // Non-breaking mirror for new admin feature set
        user.isBlocked = status === "blocked";
        await user.save();

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        next(error);
    }
};

// Admin conversation monitoring using existing Message storage.
// GET /api/v1/admin/conversations?name=&email=&role=&userId=
export const getAllConversationsAdmin = async (req, res, next) => {
    try {
        const { name, email, role, userId } = req.query;

        // Candidate user filter (optional)
        const userQuery = {};
        if (name) userQuery.name = { $regex: name, $options: "i" };
        if (email) userQuery.email = { $regex: email, $options: "i" };
        if (role) userQuery.role = role;
        if (userId) userQuery._id = userId;

        const candidateUsers = Object.keys(userQuery).length
            ? await User.find(userQuery).select("_id name email role status isBlocked")
            : await User.find().select("_id name email role status isBlocked");

        const candidateIds = candidateUsers.map(u => u._id);

        // If there is no candidate, return empty list.
        if (candidateIds.length === 0) {
            return res.status(200).json({
                success: true,
                conversations: []
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: { $in: candidateIds } },
                { receiver: { $in: candidateIds } }
            ],
            isDeleted: { $ne: true }
        }).sort({ createdAt: -1 });

        const threadsByKey = new Map();

        for (const msg of messages) {
            const key = buildConversationKey(msg.sender, msg.receiver);

            if (!threadsByKey.has(key)) {
                threadsByKey.set(key, {
                    conversationId: key,
                    recruiter: null,
                    jobSeeker: null,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    messagesCount: 0
                });
            }

            const thread = threadsByKey.get(key);
            thread.messagesCount += 1;

            // Only set recruiter/jobSeeker/admin roles when we can determine them.
            const senderProfile = candidateUsers.find(u => u._id.toString() === msg.sender.toString());
            const receiverProfile = candidateUsers.find(u => u._id.toString() === msg.receiver.toString());

            if (!thread.participants) {
                thread.participants = {};
            }

            // Track all participants with their profiles
            const aRole = senderProfile?.role;
            const bRole = receiverProfile?.role;

            if (!thread.recruiter || !thread.jobSeeker) {
                if (aRole === "recruiter" && bRole === "job_seeker") {
                    thread.recruiter = senderProfile;
                    thread.jobSeeker = receiverProfile;
                } else if (aRole === "job_seeker" && bRole === "recruiter") {
                    thread.recruiter = receiverProfile;
                    thread.jobSeeker = senderProfile;
                }
            }

            // Handle admin participants and set the other participant (non-admin) as primary display
            if (aRole === "admin" && !thread.admin) {
                thread.admin = senderProfile;
            }
            if (bRole === "admin" && !thread.admin) {
                thread.admin = receiverProfile;
            }
            
            // When admin is one participant, set the other participant for proper display
            if (aRole === "admin" && !thread.otherParticipant) {
                thread.otherParticipant = receiverProfile;
            }
            if (bRole === "admin" && !thread.otherParticipant) {
                thread.otherParticipant = senderProfile;
            }

            // Store participants for name display
            thread.participants[senderProfile?._id] = senderProfile;
            thread.participants[receiverProfile?._id] = receiverProfile;
        }

        const threads = Array.from(threadsByKey.values())
            .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
            .map(t => ({
                conversationId: t.conversationId,
                recruiter: t.recruiter,
                jobSeeker: t.jobSeeker,
                admin: t.admin,
                otherParticipant: t.otherParticipant,
                participants: t.participants,
                lastMessage: t.lastMessage,
                lastMessageTime: t.lastMessageTime,
                messagesCount: t.messagesCount,
                isLocked: false
            }));

        // Attach lock state from ConversationLock
        const conversationKeys = threads.map(t => t.conversationId);
        const locks = await ConversationLock.find({ conversationKey: { $in: conversationKeys } }).select("conversationKey isLocked");
        const lockByKey = new Map(locks.map(l => [l.conversationKey, l.isLocked]));

        const finalThreads = threads.map(t => ({
            ...t,
            isLocked: lockByKey.get(t.conversationId) ?? false,
            status: (() => {
                const blockedByParticipant =
                    t.recruiter?.isBlocked || t.jobSeeker?.isBlocked ||
                    t.recruiter?.status === "blocked" || t.jobSeeker?.status === "blocked";
                if (t.isLocked || blockedByParticipant) return "Blocked";
                return "Active";
            })()
        }));

        // Transform participants to plain objects for frontend
        const transformedThreads = finalThreads.map(t => ({
            ...t,
            participants: t.participants ? Object.values(t.participants).filter(Boolean) : []
        }));

        res.status(200).json({
            success: true,
            conversations: transformedThreads
        });
    } catch (error) {
        next(error);
    }
};

// Admin intervention: send a message inside any conversation (identified by conversationKey)
export const adminSendMessageInConversation = async (req, res, next) => {
    try {
        const { conversationKey } = req.params;
        const { content } = req.body;
        const adminId = req.user.id;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Invalid content" });
        }

        const [aId, bId] = conversationKey.split(":");
        const participants = [aId, bId];
        if (participants.some(id => !id)) {
            return res.status(400).json({ success: false, message: "Invalid conversationKey" });
        }

        const lock = await ConversationLock.findOne({ conversationKey });
        if (lock?.isLocked) {
            return res.status(423).json({ success: false, message: "Conversation is locked" });
        }

        const users = await User.find({ _id: { $in: participants } }).select("status isBlocked role");

        const userMap = new Map(users.map(u => [u._id.toString(), u]));
        const nonAdminParticipant = users.find(u => u._id.toString() !== adminId.toString())?._id || bId;

        const blockedUsers = users.filter(u => u._id.toString() !== adminId.toString() && (u.status === "blocked" || u.isBlocked === true));
        if (blockedUsers.length > 0) {
            return res.status(403).json({ success: false, message: "Cannot send message - participant is blocked" });
        }

        const receiverId = nonAdminParticipant;
        const senderId = adminId;

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim(),
            role: "admin"
        });

        // Log audit
        await logAuditAction({
            action: "admin_message_sent",
            adminId,
            conversationId: conversationKey,
            metadata: {
                messageId: message._id,
                content: message.content
            }
        });

        return res.status(200).json({
            success: true,
            message
        });
    } catch (error) {
        next(error);
    }
};

export const adminLockConversation = async (req, res, next) => {
    try {
        const { conversationKey } = req.params;
        const { isLocked, reason } = req.body;
        const adminId = req.user.id;

        if (typeof isLocked !== "boolean") {
            return res.status(400).json({ success: false, message: "isLocked must be boolean" });
        }

        const lock = await ConversationLock.findOne({ conversationKey });
        if (lock) {
            lock.isLocked = isLocked;
            if (isLocked && reason) {
                lock.flaggedReason = reason;
            }
            lock.lockedBy = adminId;
            await lock.save();
        } else {
            await ConversationLock.create({
                conversationKey,
                isLocked,
                participants: conversationKey.split(":").map(id => id),
                flaggedReason: reason,
                lockedBy: adminId
            });
        }

        // Log audit action
        await logAuditAction({
            action: isLocked ? "conversation_locked" : "conversation_unlocked",
            adminId,
            conversationId: conversationKey,
            metadata: { reason }
        });

        // Emit socket event
        if (isLocked) {
            emitConversationLocked(conversationKey);
        } else {
            emitConversationUnlocked(conversationKey);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const adminDeleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const adminId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Soft delete
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.deletedBy = adminId;
        await message.save();

        // Log audit
        await logAuditAction({
            action: "message_deleted",
            adminId,
            targetUserId: message.sender,
            conversationId: buildConversationKey(message.sender, message.receiver),
            metadata: {
                messageId: message._id,
                content: message.content
            }
        });

        // Emit socket event
        emitMessageDeleted(messageId);

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const adminDeleteConversation = async (req, res, next) => {
    try {
        const { conversationKey } = req.params;
        const adminId = req.user.id;

        const [aId, bId] = conversationKey.split(":");
        if (!aId || !bId) {
            return res.status(400).json({ success: false, message: "Invalid conversation key" });
        }

        const lock = await ConversationLock.findOne({ conversationKey });
        if (lock?.isLocked) {
            return res.status(423).json({ success: false, message: "Cannot delete a locked conversation" });
        }

        const result = await Message.updateMany(
            {
                $or: [
                    { sender: aId, receiver: bId },
                    { sender: bId, receiver: aId }
                ],
                isDeleted: { $ne: true }
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: adminId
            }
        );

        await logAuditAction({
            action: "conversation_deleted",
            adminId,
            conversationId: conversationKey,
            metadata: {
                deletedBy: adminId,
                participantA: aId,
                participantB: bId,
                messageCount: result.modifiedCount
            }
        });

        emitConversationDeleted(conversationKey, adminId);

        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
            conversationKey
        });
    } catch (error) {
        next(error);
    }
};

export const adminGetAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const result = await getAuditLogs({ page: parseInt(page), limit: parseInt(limit) });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const adminDeleteAuditLogs = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const result = await deleteAuditLogs();

        await logAuditAction({
            action: "audit_logs_deleted",
            adminId,
            metadata: { deletedCount: result.deletedCount }
        });

        res.status(200).json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        next(error);
    }
};

export const adminUnlockConversation = async (req, res, next) => {
    try {
        const { conversationKey } = req.params;
        const adminId = req.user.id;

        const lock = await unlockConversation(conversationKey, adminId);

        if (!lock) {
            return res.status(404).json({ success: false, message: "Lock record not found" });
        }

        // Log audit
        await logAuditAction({
            action: "conversation_unlocked",
            adminId,
            conversationId: conversationKey
        });

        // Emit socket event
        emitConversationUnlocked(conversationKey);

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const adminGetConversationDetails = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const messages = await getConversationDetails(conversationId);

        res.status(200).json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

export const adminBlockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.status = "blocked";
        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockedReason = reason || "No reason provided";
        user.blockedBy = adminId;
        await user.save();

        await logAuditAction({
            action: "user_blocked",
            adminId,
            targetUserId: user._id,
            metadata: { reason: user.blockedReason }
        });

        // Emit socket event
        emitUserBlocked(user._id, adminId, user.blockedReason);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isBlocked: user.isBlocked,
                blockedAt: user.blockedAt,
                blockedReason: user.blockedReason
            }
        });
    } catch (error) {
        next(error);
    }
};

export const adminUnblockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.status = "active";
        user.isBlocked = false;
        user.blockedAt = null;
        user.blockedReason = null;
        user.blockedBy = null;
        await user.save();

        await logAuditAction({
            action: "user_unblocked",
            adminId,
            targetUserId: user._id
        });

        // Emit socket event
        emitUserUnblocked(user._id, adminId);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        next(error);
    }
};

