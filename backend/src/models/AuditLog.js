import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            enum: [
                "user_blocked",
                "user_unblocked",
                "message_deleted",
                "conversation_locked",
                "conversation_unlocked",
                "admin_message_sent",
                "conversation_archived",
                "conversation_flagged",
                "conversation_deleted"
            ],
            required: true
        },
        adminId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetUserId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        conversationId: {
            type: String
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ targetUserId: 1 });

export default mongoose.model("AuditLog", auditLogSchema);