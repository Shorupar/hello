const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {

    console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ message: "No token" });

    try {
        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};