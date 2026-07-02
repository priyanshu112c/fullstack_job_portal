import { Router } from 'express'
import authenticate from '../middleware/auth.middleware.js'
import authorize from "../middleware/role.middleware.js"
import {
    dashboardStats,
    monthlyUsersStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllJobsAdmin,
    getAllConversationsAdmin,
    adminSendMessageInConversation,
    adminLockConversation,
    adminUnlockConversation,
    adminDeleteMessage,
    adminDeleteConversation,
    adminGetAuditLogs,
    adminDeleteAuditLogs,
    adminGetConversationDetails,
    adminBlockUser,
    adminUnblockUser
} from "../controllers/admin.controller.js"

const router = Router();

router.get("/dashboard", authenticate, authorize('admin'), dashboardStats)
router.get('/monthly-users', authenticate, authorize('admin'), monthlyUsersStats)

// Users management
router.get("/users", authenticate, authorize('admin'), getAllUsers)
router.put("/users/:id/role", authenticate, authorize('admin'), updateUserRole)
router.put("/users/:id/block", authenticate, authorize('admin'), adminBlockUser)
router.put("/users/:id/unblock", authenticate, authorize('admin'), adminUnblockUser)
router.delete("/users/:id", authenticate, authorize('admin'), deleteUser)

// Conversations moderation
router.get("/conversations", authenticate, authorize('admin'), getAllConversationsAdmin)
router.get("/conversations/:conversationId", authenticate, authorize('admin'), adminGetConversationDetails)
router.post(
    "/conversations/:conversationKey/messages",
    authenticate,
    authorize('admin'),
    adminSendMessageInConversation
)
router.put(
    "/conversations/:conversationKey/lock",
    authenticate,
    authorize('admin'),
    adminLockConversation
)
router.put(
    "/conversations/:conversationKey/unlock",
    authenticate,
    authorize('admin'),
    adminUnlockConversation
)
router.delete(
    "/conversations/:conversationKey",
    authenticate,
    authorize('admin'),
    adminDeleteConversation
)

// Message controls
router.delete(
    "/messages/:messageId",
    authenticate,
    authorize('admin'),
    adminDeleteMessage
)

// Audit logs
router.get("/audit-logs", authenticate, authorize('admin'), adminGetAuditLogs)
router.delete("/audit-logs", authenticate, authorize('admin'), adminDeleteAuditLogs)

// Jobs moderation
router.get("/jobs", authenticate, authorize('admin'), getAllJobsAdmin)

export default router;
