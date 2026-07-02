import {Router} from "express"
import {createJob, getJobs, getJobById, updateJob, deleteJob} from "../controllers/job.controller.js"

import authenticate from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
const router = Router();
router.get("/get-job",getJobs);
router.get("/:id", getJobById);
router.post("/create-job",authenticate,authorize("recruiter"),createJob)
router.put("/:id",authenticate,updateJob)
router.delete("/:id",authenticate,deleteJob)

export default router