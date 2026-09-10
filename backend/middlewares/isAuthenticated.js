import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
        const token = req.cookies.token || bearer;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        req.id = decode.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token", success: false });
    }
}
export default isAuthenticated;
