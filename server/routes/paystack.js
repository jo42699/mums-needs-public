
const express = require("express");
const axios = require("axios");
const Payment = require("../models/payment"); 
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

    // Generate unique reference
    const reference = "ref_" + Date.now();

    return res.json({
      reference,
      email,
      amount 
    });

  } catch (error) {
    console.error("INIT ERROR:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});


/**
 * VERIFY PAYMENT
 * Frontend sends: { reference }
 * Backend verifies with Paystack and saves Payment document
 */
router.post("/verify-payment", async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: "Reference is required" });
  }

  try {
    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data;

    // SUCCESSFUL PAYMENT
    if (data.data.status === "success") {
      const paymentMethod = data.data.channel; 
      const amountPaid = data.data.amount;     
      const transactionId = data.data.id;     
      const paidAt = data.data.paid_at;

      // Save to MongoDB using YOUR schema
      const payment = await Payment.create({
        paymentMethod,
        paymentStatus: true,
        amountPaid,
        transactionId,
        paidAt
      });

      return res.json({
        success: true,
        message: "Payment verified",
        payment
      });
    }

    // FAILED PAYMENT
    return res.json({
      success: false,
      message: "Payment not successful",
      data: data.data
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
