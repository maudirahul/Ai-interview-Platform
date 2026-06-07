const express = require('express');
const router = express.Router();
const { validateToken, attachUser } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// All payment routes are protected
router.post('/order', validateToken, attachUser, paymentController.createOrder);
router.post('/verify', validateToken, attachUser, paymentController.verifyPayment);

module.exports = router;
