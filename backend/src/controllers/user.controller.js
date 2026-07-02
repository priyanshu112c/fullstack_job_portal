import User from "../models/User.js";

import cloudinary from "../config/cloudinary.js";

import uploadToCloudinary
    from "../utils/cloudinaryUpload.js";

export const uploadResume =
    async (
        req,
        res,
        next
    ) => {

        try {

            if (!req.file) {

                return res.status(400)
                    .json({

                        success: false,

                        message:
                            "Resume required"
                    });
            }

            const user =
                await User.findById(
                    req.user.id
                );

            if (
                user.resumePublicId
            ) {

                await cloudinary.uploader.destroy(
                    user.resumePublicId,
                    {
                        resource_type:
                            "raw"
                    }
                );
            }

            const result =
                await uploadToCloudinary(
                    req.file.buffer
                );

            user.resumeUrl =
                result.secure_url;

            user.resumePublicId =
                result.public_id;

            await user.save();

            res.status(200)
                .json({

                    success: true,

                    resumeUrl:
                        user.resumeUrl
                });

        }
        catch (error) {

            next(error);

        }

    };

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (name) user.name = name;
        if (email) {
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }
            user.email = email;
        }
        await user.save();
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password -refreshToken");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};