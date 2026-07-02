import Company from "../models/Company.js"

export const createCompanyService = async (data) => {
  const existing = await Company.findOne({ recruiter: data.recruiter })
  if (existing) {
    throw new Error("Company profile already exists for this recruiter")
  }
  return Company.create(data)
}

export const getCompanyByRecruiterService = async (recruiterId) => {
  return Company.findOne({ recruiter: recruiterId })
}

export const updateCompanyService = async (recruiterId, data) => {
  return Company.findOneAndUpdate({ recruiter: recruiterId }, data, { new: true })
}

export const deleteCompanyService = async (recruiterId) => {
  return Company.findOneAndDelete({ recruiter: recruiterId })
}
