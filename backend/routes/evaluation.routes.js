const express = require("express");
const router = express.Router();
const { validateToken, attachUser } = require("../middleware/auth.middleware");
const evaluationController = require("../controllers/evaluation.controller");

router.post(
  "/session/:sessionId",
  validateToken,
  attachUser,
  evaluationController.evaluateSessionAnswers,
);

module.exports = router;
