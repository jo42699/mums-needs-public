const express = require("express");
const axios = require("axios");
const Payment = require("../models/payment");
const Order = require("../models/order");
const sendEmail = require("../utils/sendEmail");

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
 * VERIFY PAYMENT + CREATE ORDER + SEND EMAIL
 */
router.post("/verify-payment", async (req, res) => {
  try {
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

    // VERIFY WITH PAYSTACK
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data;

    // STRICT CHECK
    if (data.data.status !== "success") {
      return res.json({
        success: false,
        message: "Payment not successful",
        data: data.data
      });
    }

    // Extract payment info
    const paymentMethod = data.data.channel;
    const amountPaid = data.data.amount / 100; // convert kobo to naira
    const transactionId = data.data.id;
    const paidAt = data.data.paid_at;

    // SAVE PAYMENT
    const payment = await Payment.create({
      paymentMethod,
      paymentStatus: true,
      amountPaid,
      transactionId,
      paidAt
    });

    // CREATE ORDER
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

    // ===== EMAIL TEMPLATE =====
    const emailHTML = `
      <div style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding:30px; text-align:center; color:white;">
              <h1 style="margin:0; font-size:24px;">🎉 Payment Successful</h1>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">
                Thank you for your purchase!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333;">
              
              <p style="font-size:16px;">
                Hello <strong>${customerDetails?.name || "Customer"}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.6; color:#555;">
                Your payment has been confirmed and your order is now being processed.
                You will receive your order within 
                <strong>2–3 business days</strong>.
              </p>

              <!-- Order Summary Card -->
              <div style="margin-top:25px; border:1px solid #eee; border-radius:8px; padding:20px; background:#fafafa;">
                <h3 style="margin-top:0; color:#2c3e50;">🧾 Order Summary</h3>

                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:14px;">
                  <thead>
                    <tr style="background:#f1f1f1; text-align:left;">
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => `
                      <tr style="border-bottom:1px solid #eee;">
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₦${(item.unitPrice / 100).toLocaleString()}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>

                <div style="margin-top:15px; text-align:right; font-size:16px;">
                  <strong>Total Paid: ₦${(cartTotal / 100).toLocaleString()}</strong>
                </div>
              </div>

              <!-- Payment Details -->
              <div style="margin-top:20px; font-size:13px; color:#777;">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#888;">
              <p style="margin:0;">
                Thank you for shopping with us ❤️
              </p>
              <p style="margin:5px 0 0;">
                © ${new Date().getFullYear()} MumsNeeds. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
    `;

    // SEND CUSTOMER EMAIL
    await sendEmail(
      customerDetails.email,
      "Payment Confirmation - Order Successful 🎉",
      emailHTML
    );

    return res.json({
      success: true,
      message: "Payment verified and email sent",
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