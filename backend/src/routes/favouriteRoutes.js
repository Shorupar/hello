const router = require("express").Router();
const auth = require("../authorization/authMiddleware");
const ctrl = require("../controller/favouriteController");

router.post("/", auth, ctrl.addFavourite);

router.get("/", auth, ctrl.getFavourites);

router.delete("/:id", auth, ctrl.deleteFavourite);

module.exports = router;