const express = require("express");
const multer = require("multer");
const {
  listProfiles,
  getProfile,
  updateProfile,
} = require("../controllers/profileControllers");

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

const router = express.Router();

router.get("/list", listProfiles);
router.get("/:id", getProfile);

router.patch("/update/:id", updateProfile);

module.exports = router;
