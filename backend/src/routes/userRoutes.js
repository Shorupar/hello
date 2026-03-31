const router = require("express").Router();
const auth = require("../authorization/authMiddleware");

router.get("/me", auth, (req, res) => {
    res.json(req.user);
});

module.exports = router;