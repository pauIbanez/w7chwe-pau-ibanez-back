const express = require("express");
const multer = require("multer");
const { userRegister, loginUser } = require("../controllers/userControllers");

const uploadsFolder = "public/profiles";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsFolder);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });
// const upload = multer({ dest: "public/profiles" });

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", upload.single("avatar"), userRegister);

module.exports = router;
