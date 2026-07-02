import User from "../models/User.js"
import Job from "../models/Job.js"
import Application from "../models/Application.js"
import Company from "../models/Company.js"
import JobSeekerProfile from "../models/JobSeekerProfile.js"
import ResumeAnalysis from "../models/ResumeAnalysis.js"
import AuditLog from "../models/AuditLog.js"
import ConversationLock from "../models/ConversationLock.js"
import Message from "../models/Message.js"

export const getDashboardStats = async () => {
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: "recruiter" })
    const totalJobSeekers = await User.countDocuments({ role: "job_seeker" })
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    return {
        totalUsers,
        totalRecruiters,
        totalJobSeekers,
        totalJobs,
        totalApplications
    }
}

export const monthlyUsers = async () => {
    return await User.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' }
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: { "_id.month": 1 }
        }
    ])
}

export const logAuditAction = async ({ action, adminId, targetUserId = null, conversationId = null, metadata = {} }) => {
    return await AuditLog.create({
        action,
        adminId,
        targetUserId,
        conversationId,
        metadata
    });
}

export const getAuditLogs = async ({ page = 1, limit = 50 }) => {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find()
        .populate("adminId", "name email")
        .populate("targetUserId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments();

    return { logs, total, page, limit };
}

export const getConversationDetails = async (conversationKey) => {
    const [aId, bId] = conversationKey.split(":");
    if (!aId || !bId) return [];

    const messages = await Message.find({
        $or: [
            { sender: aId, receiver: bId },
            { sender: bId, receiver: aId }
        ],
        isDeleted: { $ne: true }
    }).sort({ createdAt: 1 });

    return messages;
}

export const unlockConversation = async (conversationKey, adminId) => {
    const lock = await ConversationLock.findOne({ conversationKey });
    if (lock) {
        lock.isLocked = false;
        await lock.save();
        return lock;
    }
    return null;
}

export const deleteAuditLogs = async () => {
    const result = await AuditLog.deleteMany({});
    return result;
}

export const deleteUserWithCascade = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;

    const result = {
        deletedJobs: 0,
        deletedApplications: 0,
        deletedCompany: false,
        deletedProfile: false,
        deletedResumeAnalysis: false,
    };

    if (user.role === "recruiter") {
        const jobs = await Job.find({ recruiter: userId }).select("_id");
        const jobIds = jobs.map(j => j._id);

        if (jobIds.length > 0) {
            const appResult = await Application.deleteMany({ job: { $in: jobIds } });
            result.deletedApplications = appResult.deletedCount;

            const jobResult = await Job.deleteMany({ _id: { $in: jobIds } });
            result.deletedJobs = jobResult.deletedCount;
        }

        const companyResult = await Company.findOneAndDelete({ recruiter: userId });
        result.deletedCompany = !!companyResult;

    } else if (user.role === "job_seeker") {
        const appResult = await Application.deleteMany({ applicant: userId });
        result.deletedApplications = appResult.deletedCount;

        const profileResult = await JobSeekerProfile.findOneAndDelete({ user: userId });
        result.deletedProfile = !!profileResult;
    }

    const resumeResult = await ResumeAnalysis.findOneAndDelete({ user: userId });
    result.deletedResumeAnalysis = !!resumeResult;

    await User.findByIdAndDelete(userId);

    return result;
}