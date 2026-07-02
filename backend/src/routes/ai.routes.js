import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { analyzeResume, getLatestAnalysis } from "../controllers/ai.controller.js";

const router = Router();

router.get("/resume-analysis", authenticate, authorize("job_seeker"), getLatestAnalysis)
router.post("/resume-analysis", authenticate, authorize("job_seeker"), analyzeResume)

export default router;