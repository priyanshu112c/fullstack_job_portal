import { Router } from 'express'
import authenticate from '../middleware/auth.middleware.js'
import { getConnversation, getConversationsList, deleteConversation } from '../controllers/message.controller.js'

const router = Router();

router.get("/conversations", authenticate, getConversationsList)
router.get("/:userId", authenticate, getConnversation)
router.delete("/conversations/:userId", authenticate, deleteConversation)

export default router;