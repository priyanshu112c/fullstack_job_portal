import User from "../models/User.js"
export const updateResumeService = async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true })
}