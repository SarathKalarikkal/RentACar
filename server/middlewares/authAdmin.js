import jwt from "jsonwebtoken";

export const authAdmin = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ success: false, message: "admin not authenticated" });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);


        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "admin not authenticated" });
        }

        if (tokenVerified.role !== "admin") {
            return res.status(403).json({ message: "admin not authenticated" });
        }

        req.user = tokenVerified;
        next();
        
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};