// routes/paystack.js
const express = require("express");
const axios = require("axios");
const Payment = require("../models/payment");
const Order = require("../models/order");

const router = express.Router();

/**
 * INIT PAYMENT
 */
router.post("/init", async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: "Email and amount are required" });
    }

    const reference = "ref_" + Date.now();

    return res.json({ reference, email, amount });

  } catch (error) {
    console.error("INIT ERROR:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

/**
 * VERIFY PAYMENT + CREATE ORDER
 */
router.post("/verify-payment", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const {
      reference,
      items,
      customerDetails,
      customerId,
      cartTotal
    } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // ⭐ VERIFY WITH PAYSTACK
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data;

    if (data.data.status !== "success") {
      return res.json({
        success: false,
        message: "Payment not successful",
        data: data.data
      });
    }

    // ⭐ Extract payment info
    const paymentMethod = data.data.channel;
    const amountPaid = data.data.amount;
    const transactionId = data.data.id;
    const paidAt = data.data.paid_at;

    // ⭐ Save Payment
    const payment = await Payment.create({
      paymentMethod,
      paymentStatus: true,
      amountPaid,
      transactionId,
      paidAt
    });

    // ⭐ CREATE ORDER (customer is STRING — Firebase UID)
    const order = await Order.create({
      customer: customerId,
      customerDetails,
      items,
      cartTotal,
      payment: {
        paymentMethod,
        paymentStatus: true,
        amountPaid,
        transactionId,
        paidAt
      }
    });

    return res.json({
      success: true,
      message: "Payment verified",
      orderId: order._id,
      order
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
});

module.exports = router;
