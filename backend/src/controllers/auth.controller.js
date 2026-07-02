import { registerUser, loginUser } from '../services/auth.service.js'
import User from '../models/User.js'
import Company from '../models/Company.js'
import { generateAccessToken, generateRefreshToken } from '../utils/token.js'
import jwt from "jsonwebtoken"

export const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body)
        await user.save()
        res.status(201).json({
            success: true,
            message: "User registered successfully"
        })
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await loginUser(email, password)
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user)
        user.refreshToken = refreshToken;
        await user.save()

        let hasCompany = false
        if (user.role === "recruiter") {
            const company = await Company.findOne({ recruiter: user._id })
            hasCompany = !!company
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        })

        res.status(200).json({
            success: true,
            accessToken,
            role: user.role,
            hasCompany,
            onboardingCompleted: user.onboardingCompleted || false,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        next(err)
    }
}

export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token missing" })
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        } catch {
            return res.status(401).json({ success: false, message: "Refresh token expired or invalid" })
        }

        const user = await User.findById(decoded.id)
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" })
        }

        if (user.status === "blocked" || user.isBlocked === true) {
            return res.status(403).json({ success: false, message: "Account blocked" })
        }

        let hasCompany = false
        if (user.role === "recruiter") {
            const company = await Company.findOne({ recruiter: user._id })
            hasCompany = !!company
        }

        const newAccessToken = generateAccessToken(user);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            role: user.role,
            hasCompany,
            onboardingCompleted: user.onboardingCompleted || false,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const user = await User.findOne({ refreshToken })
            if (user) {
                user.refreshToken = null;
                await user.save()
            }
        }
        res.clearCookie("refreshToken", { path: "/" })
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        next(err)
    }
}

