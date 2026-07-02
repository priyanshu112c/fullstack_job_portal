import { Router } from "express"
import {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany
} from "../controllers/company.controller.js"
import authenticate from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import { uploadImage } from "../middleware/upload.middleware.js"

const router = Router()

router.post("/register", authenticate, authorize("recruiter"), uploadImage.single("companyLogo"), createCompany)
router.get("/me", authenticate, authorize("recruiter"), getCompany)
router.put("/me", authenticate, authorize("recruiter"), uploadImage.single("companyLogo"), updateCompany)
router.delete("/me", authenticate, authorize("recruiter"), deleteCompany)

export default router
