import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
    try {
        // Some environments/libraries may send different casing; normalize.
        const authHeader =
            req.headers.authorization ||
            req.headers.Authorization ||
            req.headers.AUTHORIZATION;

        if (!authHeader) {
            console.error("[auth] Missing authorization header");
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const [scheme, token] = authHeader.split(" ");
        if (!token || scheme?.toLowerCase() !== "bearer") {
            console.error("[auth] Invalid authorization header format:", authHeader);
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            const user = await User.findById(decoded.id).select("status role name email isBlocked");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            if (user.status === "blocked" || user.isBlocked === true) {
                return res.status(403).json({
                    success: false,
                    message: "Account blocked"
                });
            }

            // Keep backward compatibility: req.user.id/role are used across codebase
            req.user = {
                ...decoded,
                id: user._id.toString(),
                role: user.role,
                status: user.status,
                isBlocked: user.isBlocked
            };

            return next();
        } catch (verifyErr) {
            console.error("[auth] JWT verification failed:", verifyErr?.message);
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
    } catch (err) {
        console.error("[auth] Unexpected error:", err);
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

export default authenticate;
