// routes/upload.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateToken, attachUser } = require("../middleware/auth.middleware");
const uploadController = require("../controllers/upload.controller");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter,
});

router.post(
  "/audio",
  validateToken,
  attachUser,
  upload.single("audio"),
  uploadController.uploadAudio,
);

router.post(
  "/audio/followup",
  validateToken,
  attachUser,
  upload.single("audio"),
  uploadController.uploadFollowUpAudio,
);

module.exports = router;
