import {
  createCompanyService,
  getCompanyByRecruiterService,
  updateCompanyService,
  deleteCompanyService
} from "../services/company.service.js"
import uploadToCloudinary from "../utils/cloudinaryUpload.js"

export const createCompany = async (req, res, next) => {
  try {
    const existing = await getCompanyByRecruiterService(req.user.id)
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Company profile already exists for this recruiter"
      })
    }

    let companyLogo = null
    let companyLogoPublicId = null

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "company_logos",
        resourceType: "image"
      })
      companyLogo = result.secure_url
      companyLogoPublicId = result.public_id
    }

    const company = await createCompanyService({
      companyName: req.body.companyName,
      websiteUrl: req.body.websiteUrl,
      socialLinks: req.body.socialLinks,
      gstNumber: req.body.gstNumber,
      uinNumber: req.body.uinNumber,
      companyLogo,
      companyLogoPublicId,
      recruiter: req.user.id
    })

    res.status(201).json({ success: true, company })
  } catch (error) {
    next(error)
  }
}

export const getCompany = async (req, res, next) => {
  try {
    const company = await getCompanyByRecruiterService(req.user.id)
    if (!company) {
      return res.status(200).json({ success: true, company: null })
    }
    res.status(200).json({ success: true, company })
  } catch (error) {
    next(error)
  }
}

export const updateCompany = async (req, res, next) => {
  try {
    const existing = await getCompanyByRecruiterService(req.user.id)
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      })
    }

    const updateData = {
      companyName: req.body.companyName,
      websiteUrl: req.body.websiteUrl,
      socialLinks: req.body.socialLinks,
      gstNumber: req.body.gstNumber,
      uinNumber: req.body.uinNumber
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "company_logos",
        resourceType: "image"
      })
      updateData.companyLogo = result.secure_url
      updateData.companyLogoPublicId = result.public_id
    }

    const company = await updateCompanyService(req.user.id, updateData)

    res.status(200).json({ success: true, company })
  } catch (error) {
    next(error)
  }
}

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await getCompanyByRecruiterService(req.user.id)
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      })
    }

    await deleteCompanyService(req.user.id)

    res.status(200).json({
      success: true,
      message: "Company profile deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}
