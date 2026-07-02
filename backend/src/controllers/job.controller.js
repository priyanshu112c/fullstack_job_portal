import Job from "../models/Job.js"
import Company from "../models/Company.js"
import { createJobsService, getAllJobsService } from "../services/job.service.js"

export const createJob = async (req, res, next) => {
    try {
        const company = await Company.findOne({ recruiter: req.user.id })
        if (!company) {
            return res.status(400).json({
                success: false,
                message: "You must register your company before creating a job"
            })
        }

        const job = await createJobsService({
            ...req.body,
            company: company.companyName,
            companyLogo: company.companyLogo,
            recruiter: req.user.id
        })
        res.status(201).json({
            success: true,
            job
        })
    } catch (error) {
        next(error)
    }
}

export const getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).lean();
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        next(error);
    }
};

export const getJobs = async (req, res, next) => {
    try {
        const { keyword, location, type } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {
            isActive: true,
        }
        if (keyword) {
            filter.title = {
                $regex: keyword,
                $options: "i"
            }
        }
        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            }
        }
        if (type) {
            filter.employmentType = type;
        }

        const jobs = await getAllJobsService(filter, skip, limit)
        const totalRecords = await Job.countDocuments(filter);
        res.status(200).json({
            success: true,
            jobs,
            page,
            totalPage: Math.ceil(totalRecords / limit),
            totalRecords
        })
    } catch (error) {
        next(error)
    }
}

export const updateJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        if (job.recruiter.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { company, companyLogo, ...rest } = req.body;

        const updated = await Job.findByIdAndUpdate(req.params.id, rest, { new: true });
        res.status(200).json({
            success: true,
            job: updated
        });
    } catch (error) {
        next(error);
    }
};

export const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        if (job.recruiter.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};