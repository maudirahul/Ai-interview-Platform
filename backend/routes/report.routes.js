const express = require("express");
const router = express.Router();
const { validateToken, attachUser } = require("../middleware/auth.middleware");
const reportController = require("../controllers/report.controller");

// Generate report for a session
router.post(
  "/session/:sessionId/generate",
  validateToken,
  attachUser,
  reportController.generate,
);

// Get report by session ID
router.get(
  "/session/:sessionId",
  validateToken,
  attachUser,
  reportController.getBySession,
);

// Get all reports for logged in user
router.get("/me", validateToken, attachUser, reportController.getUserReports);

// Public share route — no auth needed
router.get("/share/:token", reportController.getByShareToken);

module.exports = router;
