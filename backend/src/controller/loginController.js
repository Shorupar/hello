const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
    try{
        console.log("BODY:", req.body);

        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email=?", 
            [email]
        );

        console.log("DB RESULT:", rows);

        if (!rows.length)
            return res.status(400).json({ message: "Invalid credentials" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);

        res.json({
            message: "Login success",
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        });
    }catch(err) {
        console.log("LOGIN ERROR:", err);
        res.status(500).json({message: "Server error"});
    }
};