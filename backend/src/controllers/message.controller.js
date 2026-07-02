import Message from "../models/Message.js"
import User from "../models/User.js"
import ConversationLock from "../models/ConversationLock.js"
import { emitConversationDeleted } from "../sockets/socket.js"
import { logAuditAction } from "../services/admin.service.js"

const buildConversationKey = (a, b) => {
    const [x, y] = [a?.toString(), b?.toString()].sort();
    return `${x}:${y}`;
};

export const getConnversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;
        const message = await Message.find({
            $or: [
                {
                    sender: userId,
                    receiver: otherUserId
                },
                {
                    sender: otherUserId,
                    receiver: userId
                }
            ],
            isDeleted: { $ne: true }
        }).sort({ createdAt: 1 })

        res.status(200).json({
            success: true,
            message
        })
    } catch (err) {
        next(err)
    }
}

export const getConversationsList = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Find all messages involving the logged-in user (excluding soft-deleted)
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            isDeleted: { $ne: true }
        }).sort({ createdAt: -1 });

        // Extract unique user IDs of partners
        const partnerIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== userId) {
                partnerIds.add(msg.sender.toString());
            }
            if (msg.receiver.toString() !== userId) {
                partnerIds.add(msg.receiver.toString());
            }
        });

        // Fetch user profiles for all conversation partners
        const partners = await User.find({ _id: { $in: Array.from(partnerIds) } })
            .select("name email role");

        // Construct threads with last message
        const threads = partners.map(partner => {
            const lastMsg = messages.find(msg => 
                (msg.sender.toString() === userId && msg.receiver.toString() === partner._id.toString()) ||
                (msg.sender.toString() === partner._id.toString() && msg.receiver.toString() === userId)
            );
            return {
                partner,
                lastMessage: lastMsg ? lastMsg.content : "",
                lastMessageTime: lastMsg ? lastMsg.createdAt : null
            };
        });

        // Sort by last message time
        threads.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        res.status(200).json({
            success: true,
            conversations: threads
        });
    } catch (err) {
        next(err);
    }
};

export const deleteConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const threadExists = await Message.findOne({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ],
            isDeleted: { $ne: true }
        });

        if (!threadExists) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const conversationKey = buildConversationKey(userId, otherUserId);

        const lock = await ConversationLock.findOne({ conversationKey });
        if (lock?.isLocked) {
            return res.status(423).json({
                success: false,
                message: "Cannot delete a locked conversation"
            });
        }

        await Message.updateMany(
            {
                $or: [
                    { sender: userId, receiver: otherUserId },
                    { sender: otherUserId, receiver: userId }
                ],
                isDeleted: { $ne: true }
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId
            }
        );

        await logAuditAction({
            action: "conversation_deleted",
            adminId: userId,
            targetUserId: otherUserId,
            conversationId: conversationKey,
            metadata: {
                deletedBy: userId,
                partnerId: otherUserId
            }
        });

        emitConversationDeleted(conversationKey, userId);

        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
            conversationKey,
            otherUserId
        });
    } catch (err) {
        next(err)
    }
};