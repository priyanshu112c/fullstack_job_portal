import User from "../models/User.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import {applyJobService,getMyApplicationsService,deleteApplicationService} from "../services/application.service.js";

export const applyJob = async(req,res,next)=>{
    try{
        const existing = await Application.findOne({
            applicant:req.user.id,
            job:req.params.id,
        })
        if(existing){
            return res.status(400).json({
                success:false,
                message:"Already applied"
            })
        }

        const user = await User.findById(req.user.id);
        const resumeUrl = user?.resumeUrl || "";

        const application = await applyJobService(req.user.id,req.params.id,resumeUrl)
        res.status(201).json({
            success:true,
            application,
        })
    }catch(error){
        next(error)
    }
}

export const getMyApplications = async (req,res,next)=>{
    try {
        const applications = await getMyApplicationsService(
            req.user.id
        );
        res.status(200).json({
            success:true,
            applications
        })
    } catch (error) {
        next(error)
    }
}

export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate("job");
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (application.job.recruiter.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicationById = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate("job")
            .populate("applicant");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (application.job && application.job.recruiter &&
            application.job.recruiter.toString() !== req.user.id &&
            req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this application"
            });
        }

        const profile = await JobSeekerProfile.findOne({ user: application.applicant._id });

        res.status(200).json({
            success: true,
            application,
            profile
        });
    } catch (error) {
        next(error);
    }
};

export const deleteApplication = async (req, res, next) => {
    try {
        const application = await deleteApplicationService(req.params.id, req.user.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found or unauthorized"
            });
        }
        res.status(200).json({
            success: true,
            message: "Application deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getRecruiterApplications = async (req, res, next) => {
    try {
        const recruiterJobs = await Job.find({ recruiter: req.user.id }).select("_id");
        const jobIds = recruiterJobs.map((j) => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate("job")
            .populate("applicant", "name email resumeUrl");

        res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        next(error);
    }
};