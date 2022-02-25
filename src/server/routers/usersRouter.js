const express = require("express");
const { userRegister } = require("../controllers/userRegister");

const router = express.Router();

router.post("/login");

router.post("/register", userRegister);
module.exports = router;
