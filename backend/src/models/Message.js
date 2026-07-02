import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // Non-breaking addition for admin intervention:
    // - When admin sends a message, mark sender role as "admin"
    // - Kept optional to avoid breaking existing documents/queries
    role: {
        type: String,
        enum: ["admin", "user", "recruiter", "system"],
        default: undefined
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Soft-delete support
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true
})

export default mongoose.model("Message", messageSchema)

