const express = require("express");
const { userRegister, loginUser } = require("../controllers/userControllers");

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", userRegister, loginUser);
module.exports = router;
