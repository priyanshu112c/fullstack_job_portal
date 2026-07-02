import mongoose from "mongoose";

const conversationLockSchema = new mongoose.Schema(
    {
        conversationKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            }
        ],
        isLocked: {
            type: Boolean,
            default: false,
        },
        // Archive support
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        archivedAt: {
            type: Date,
            default: null
        },
        archivedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null
        },
        // Flag support
        isFlagged: {
            type: Boolean,
            default: false,
            index: true
        },
        flaggedReason: {
            type: String,
            default: null
        },
        flaggedAt: {
            type: Date,
            default: null
        },
        flaggedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null
        },
        lockedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

export default mongoose.model("ConversationLock", conversationLockSchema);
