const express = require("express");
const router = express.Router();
const { validateToken, attachUser } = require("../middleware/auth.middleware");
const questionController = require("../controllers/question.controller");

// Get all available roles — protected
router.get("/roles", validateToken, attachUser, questionController.getRoles);

// Prepare question set for a session — protected
router.post(
  "/prepare",
  validateToken,
  attachUser,
  questionController.prepareQuestions,
);

module.exports = router;
