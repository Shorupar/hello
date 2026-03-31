const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

const emailVad = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        if (!name || !email || !password || !confirmPassword || !role)
            return res.status(400).json({ message: "All fileds required" });

        if (!emailVad.test(email))
            return res.status(400).json({ message: "Invalid email" });

        if(password.length < 6)
            return res.status(400).json({ message: "Password min 6 characters" });

        if(password !== confirmPassword)
            return res.status(400).json({ message: "Passwords do not match" });

        if(!["buyer", "seller"].includes(role))
            return res.status(400).json({ message: "Invalid role" });

        const [existing] = await db.query(
            "SELECT id FROM users WHERE email=?", 
            [email]
        );

        if (existing.length)
            return res.status(400).json({message: "Email exists" });

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)", 
            [name,email, hashed, role]
        );

        const token = generateToken({
            id: result.insertId,
            name,
            role,
        });

        res.json({
            message: "Signup sucess",
            token,
            user: { id: result.insertId, name, role },
        });
    } catch {
        console.log(err);
        res.status(500).json({message: "Server error" });
    }
};