import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { createProfile, getMyProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.post("/", authenticate, createProfile);
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateProfile);

export default router;
