import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    console.log("Verifying token...");
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        console.log("Token found, verifying...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified, user ID:", decoded.userId);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(401).json({ message: "Invalid token." });
    }
}; 