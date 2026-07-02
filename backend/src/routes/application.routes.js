import { Router } from "express";
import {
  applyJob,
  getMyApplications,
  updateApplicationStatus,
  getRecruiterApplications,
  getApplicationById,
  deleteApplication,
} from "../controllers/application.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/jobs/:id/apply",
  authenticate,
  authorize("job_seeker"),
  applyJob
);

router.get(
  "/me",
  authenticate,
  authorize("job_seeker"),
  getMyApplications
);

router.get(
  "/recruiter",
  authenticate,
  authorize("recruiter", "admin"),
  getRecruiterApplications
);

router.delete(
  "/:id",
  authenticate,
  authorize("job_seeker"),
  deleteApplication
);

router.get(
  "/:id",
  authenticate,
  authorize("recruiter", "admin"),
  getApplicationById
);

router.put(
  "/:id/status",
  authenticate,
  authorize("recruiter", "admin"),
  updateApplicationStatus
);

export default router;