const express = require("express");
const router = express.Router();
const { validateToken, attachUser } = require("../middleware/auth.middleware");
const sessionController = require("../controllers/session.controller");

// All routes protected
router.post(
  "/create",
  validateToken,
  attachUser,
  sessionController.createSession,
);

router.get(
  "/history",
  validateToken,
  attachUser,
  sessionController.getSessionHistory,
);

router.get("/:id", validateToken, attachUser, sessionController.getSession);

router.put(
  "/:id/start",
  validateToken,
  attachUser,
  sessionController.startSession,
);

router.put(
  "/:id/current-question",
  validateToken,
  attachUser,
  sessionController.updateCurrentQuestion,
);

router.put(
  "/:id/question-answered",
  validateToken,
  attachUser,
  sessionController.markQuestionAnswered,
);

router.put("/:id/end", validateToken, attachUser, sessionController.endSession);

router.put(
  "/:id/abandon",
  validateToken,
  attachUser,
  sessionController.abandonSession,
);

module.exports = router;
