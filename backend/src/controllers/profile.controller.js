import JobSeekerProfile from "../models/JobSeekerProfile.js";
import User from "../models/User.js";

export const createProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const existing = await JobSeekerProfile.findOne({ user: userId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Profile already exists. Use PUT to update.",
            });
        }

        const profile = new JobSeekerProfile({
            user: userId,
            personalDetails: {
                phone: req.body.personalDetails?.phone || "",
                bio: req.body.personalDetails?.bio || "",
                location: req.body.personalDetails?.location || "",
                dateOfBirth: req.body.personalDetails?.dateOfBirth || null,
                linkedIn: req.body.personalDetails?.linkedIn || "",
                github: req.body.personalDetails?.github || "",
                website: req.body.personalDetails?.website || "",
            },
            education: req.body.education || [],
            workExperience: req.body.workExperience || [],
            projects: req.body.projects || [],
            certifications: req.body.certifications || [],
            skills: req.body.skills || [],
            resumeUrl: req.body.resumeUrl || "",
            resumePublicId: req.body.resumePublicId || "",
        });

        await profile.save();

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const getMyProfile = async (req, res, next) => {
    try {
        const profile = await JobSeekerProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const updateData = {
            "personalDetails.phone": req.body.personalDetails?.phone ?? "",
            "personalDetails.bio": req.body.personalDetails?.bio ?? "",
            "personalDetails.location": req.body.personalDetails?.location ?? "",
            "personalDetails.dateOfBirth": req.body.personalDetails?.dateOfBirth ?? null,
            "personalDetails.linkedIn": req.body.personalDetails?.linkedIn ?? "",
            "personalDetails.github": req.body.personalDetails?.github ?? "",
            "personalDetails.website": req.body.personalDetails?.website ?? "",
            education: req.body.education || [],
            workExperience: req.body.workExperience || [],
            projects: req.body.projects || [],
            certifications: req.body.certifications || [],
            skills: req.body.skills || [],
            resumeUrl: req.body.resumeUrl ?? "",
            resumePublicId: req.body.resumePublicId ?? "",
        };

        const profile = await JobSeekerProfile.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (err) {
        next(err);
    }
};
