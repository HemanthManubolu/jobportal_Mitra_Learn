import { User } from "../models/user.model.js";

export const authorizeRoles = (...roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
        if (!roles.includes(user.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
