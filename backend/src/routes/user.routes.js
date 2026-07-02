import { Router } from "express"
import authenticate from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import upload from "../middleware/upload.middleware.js"
import { uploadResume, getUserProfile, updateUserProfile, getUserById } from "../controllers/user.controller.js"

const router = Router();

router.get("/me", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.get("/:id", authenticate, getUserById);
router.put("/upload-resume", authenticate, authorize("job_seeker"), upload.single("resume"), uploadResume);

export default router;