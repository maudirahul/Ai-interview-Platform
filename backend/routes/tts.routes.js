const express = require('express');
const router = express.Router();
const { validateToken, attachUser } = require('../middleware/auth.middleware');
const ttsController = require('../controllers/tts.controller');

// Protected — only logged in users can generate speech
router.post(
  '/speak',
  validateToken,
  attachUser,
  ttsController.speak
);

module.exports = router;