import Message from "../models/Message.js"
import User from "../models/User.js"
import ConversationLock from "../models/ConversationLock.js"

let io;

const socketHandler = (socketIo) => {
    io = socketIo;
    
    io.on("connection", (socket) => {
        socket.on("join", async (userId) => {
            if (!userId) return

            // Blocked users cannot participate in chat rooms
            const user = await User.findById(userId).select("status isBlocked")
            if (user?.status === "blocked" || user?.isBlocked === true) return

            socket.join(userId)
        })

        socket.on("send_message", async (data) => {
            const { sender, receiver, content } = data
            if (!sender || !receiver || !content) return

            // Blocked users cannot send messages
            const [senderUser, receiverUser] = await Promise.all([
                User.findById(sender).select("status isBlocked role"),
                User.findById(receiver).select("status isBlocked")
            ])

            if (senderUser?.status === "blocked" || senderUser?.isBlocked === true) return
            if (receiverUser?.status === "blocked" || receiverUser?.isBlocked === true) return

            // Check for locked conversation
            const sortedIds = [sender, receiver].sort();
            const conversationKey = `${sortedIds[0]}:${sortedIds[1]}`;

            const lock = await ConversationLock.findOne({ conversationKey }).select("isLocked");
            if (lock?.isLocked) return

            const message = await Message.create({ sender, receiver, content })

            io.to(sender).to(receiver).emit("receive_message", message)
        })

        // Admin joins a conversation room
        socket.on("admin_join_conversation", async (conversationKey) => {
            if (!conversationKey) return
            socket.join(`admin:${conversationKey}`)

            // Notify others admin joined
            socket.to(`admin:${conversationKey}`).emit("admin_joined_conversation", {
                conversationKey,
                adminId: socket.userId
            })
        })

        // Admin sends message to conversation
        socket.on("admin_send_message", async (data) => {
            const { conversationKey, content, sender: adminId } = data
            if (!conversationKey || !content) return

            const [aId, bId] = conversationKey.split(":")
            if (!aId || !bId) return

            const message = await Message.create({
                sender: adminId,
                receiver: bId,
                content,
                role: "admin"
            })

            // Emit to all participants and admin room
            io.to(aId).to(bId).to(`admin:${conversationKey}`).emit("admin_message", message)
            io.to(aId).to(bId).emit("receive_message", message)
        })

        socket.on("disconnect", () => {
            const rooms = Array.from(socket.rooms)
            rooms.forEach((room) => {
                if (room !== socket.id) {
                    socket.leave(room)
                }
            })
        })
    })
}

// Export function to emit admin events from controllers
export const emitConversationLocked = (conversationKey) => {
    if (io) io.emit("conversation_locked", { conversationKey });
};

export const emitConversationUnlocked = (conversationKey) => {
    if (io) io.emit("conversation_unlocked", { conversationKey });
};

export const emitConversationDeleted = (conversationKey, deletedBy) => {
    if (!io) return;
    const [aId, bId] = conversationKey.split(":");
    if (aId && bId) {
        io.to(aId).to(bId).emit("conversation_deleted", { conversationKey, deletedBy });
    } else {
        io.emit("conversation_deleted", { conversationKey, deletedBy });
    }
};

export const emitMessageDeleted = (messageId, conversationKey) => {
    if (!io) return;
    if (conversationKey) {
        const [aId, bId] = conversationKey.split(":");
        if (aId && bId) {
            io.to(aId).to(bId).emit("message_deleted", { messageId });
            return;
        }
    }
    io.emit("message_deleted", { messageId });
};

export const emitUserBlocked = (userId, blockedBy, reason) => {
    if (io) io.emit("user_blocked", { userId, blockedBy, reason });
};

export const emitUserUnblocked = (userId, unblockedBy) => {
    if (io) io.emit("user_unblocked", { userId, unblockedBy });
};

export default socketHandler;
