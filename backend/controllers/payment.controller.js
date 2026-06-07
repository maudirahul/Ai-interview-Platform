const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Initialize Razorpay SDK.
// Make sure to handle missing key environment variables gracefully.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// Pack size to pricing structure:
// 3 Sessions = ₹29
// 5 Sessions = ₹49
// 10 Sessions = ₹75
const PACK_PRICES = {
  3: 29,
  5: 49,
  10: 75
};

const createOrder = async (req, res, next) => {
  try {
    const { packSize } = req.body;
    const price = PACK_PRICES[packSize];

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack size selected.",
      });
    }

    const options = {
      amount: price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_session_${Date.now()}_${req.user._id.toString().slice(-6)}`,
      notes: {
        userId: req.user._id.toString(),
        packSize: packSize.toString(),
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packSize
    });

  } catch (err) {
    console.error("[Razorpay Create Order Error]:", err);
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packSize
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packSize) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details.",
      });
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: invalid signature.",
      });
    }

    const packCount = parseInt(packSize, 10);
    const amount = PACK_PRICES[packCount] || 0;

    // Create successful transaction record
    await Transaction.create({
      userId: req.user._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount,
      packSize: packCount,
      status: "success",
    });

    // Increment user session balance
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { sessionBalance: packCount }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      user: updatedUser
    });

  } catch (err) {
    console.error("[Razorpay Verification Error]:", err);
    next(err);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    console.error("[Get Transaction History Error]:", err);
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getTransactionHistory
};
