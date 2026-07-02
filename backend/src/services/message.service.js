import Message from "../models/Message.js"
export const saveMessage = async (sender, receiver, content) => {
    return await Message.create({ sender, receiver, content })
}