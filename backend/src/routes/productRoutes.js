const router = require("express").Router();
const auth = require("../authorization/authMiddleware");
const upload = require("../config/multer");
const ctrl = require("../controller/productController");

router.get("/", auth, ctrl.getProducts);

router.post("/", auth, upload.single("image"), ctrl.addProduct);

router.delete("/:id", auth, ctrl.deleteProduct);

module.exports = router;