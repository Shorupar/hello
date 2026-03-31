const router = require("express").Router();
const { signup } = require("../controller/signupController");

router.post("/", signup);

module.exports = router;