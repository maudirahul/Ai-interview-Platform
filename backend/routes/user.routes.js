const express = require('express');
const router = express.Router();
const { validateToken, attachUser } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// All user routes are protected
router.get('/me', validateToken, attachUser, userController.getMe);
router.put('/me', validateToken, attachUser, userController.updateMe);

module.exports = router;