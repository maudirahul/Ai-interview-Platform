const express = require('express');
const router = express.Router();
const { validateToken, attachUser } = require('../middleware/auth.middleware');
const transcriptionController = require('../controllers/transcription.controller');

// Transcribe all answers for a session
router.post(
  '/session/:sessionId',
  validateToken,
  attachUser,
  transcriptionController.transcribeSession
);

// Get all transcripts for a session
router.get(
  '/session/:sessionId',
  validateToken,
  attachUser,
  transcriptionController.getSessionTranscripts
);

module.exports = router;