
import Message from "../models/Message.js"
const onlineUsers = new Map();
const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected", socket.io)

        socket.on("join", (userId) => {
            onlineUsers.set(userId, socket.id)
        })
        socket.on("send_message", async (data) => {
            const { sender, receiver, content } = data;
            const message = await Message.create({
                sender,
                receiver,
                content
            })
            const receiverScoketId = onlineUsers.get(receiver)
            if (receiverScoketId) {
                io.to(receiverSocketId).emit("receive_message", message)
            }

        })
        socket.on("disconnect", () => {
            console.log("Disconnected", socket.id)
        })
    })
}

export default socketHandler;