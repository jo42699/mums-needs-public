const express = require("express");
const axios = require("axios");
const Payment = require("../models/payment");
const Order = require("../models/order");
const Product = require("../models/products");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const router = express.Router();

const SHIPPING_FEE = 400000;

router.post("/init", async (req, res) => {
  try {
    const { email, items } = req.body;

    if (!email || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Email and items are required"
      });
    }

    let cartTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart"
        });
      }

      const unitPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      cartTotal += unitPrice * item.quantity;
    }

    const finalAmount = cartTotal + SHIPPING_FEE;

    const reference = crypto.randomBytes(16).toString("hex");

    return res.json({
      success: true,
      reference,
      email,
      cartTotal,
      shippingFee: SHIPPING_FEE,
      finalAmount
    });

  } catch (error) {
    console.error("INIT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed"
    });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { reference, items, customerDetails, customerId } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

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

    const paymentMethod = data.data.channel;
    const amountPaid = data.data.amount;
    const transactionId = data.data.id;
    const paidAt = data.data.paid_at;

    let serverCartTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) continue;

      const unitPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      serverCartTotal += unitPrice * item.quantity;
    }

    const expectedTotal = serverCartTotal + SHIPPING_FEE;

    if (expectedTotal !== amountPaid) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch — possible tampering"
      });
    }

    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Duplicate transaction detected"
      });
    }



    await Payment.create({
      paymentMethod,
      paymentStatus: true,
      amountPaid,
      transactionId,
      paidAt
    });

    const order = await Order.create({
      customer: customerId,
      customerDetails,
      items,
      cartTotal: serverCartTotal,
      shippingFee: SHIPPING_FEE,
      grandTotal: expectedTotal,
      payment: {
        paymentMethod,
        paymentStatus: true,
        amountPaid,
        transactionId,
        paidAt
      }
    });

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const size = String(item.size).trim();
      const qty = Number(item.quantity);

      if (item.variantName) {
        const variant = product.variants.find(
          v => v.variantName === item.variantName
        );

        if (!variant) continue;

        const stock = variant.VariantStockBySize;
        if (!(stock instanceof Map)) continue;
        if (!stock.has(size)) continue;

        const currentStock = Number(stock.get(size)) || 0;
        const newStock = Math.max(currentStock - qty, 0);
        stock.set(size, newStock);
      } else {
        const stock = product.stockBySize;

        if (stock instanceof Map && stock.has(size)) {
          const currentStock = Number(stock.get(size)) || 0;
          const newStock = Math.max(currentStock - qty, 0);
          stock.set(size, newStock);
        }
      }

      await product.save();
    }
    // EMAIL TEMPLATE FOR BREVO 
    const emailHTML = `
      <div style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

                <tr>
                  <td style="background: linear-gradient(135deg, #cd0fba, #9a2ecc); padding:30px; text-align:center; color:white;">
                    <h1 style="margin:0; font-size:24px;">Payment Successful</h1>
                    <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">
                      Thank you for your purchase!
                    </p>
                  </td>
                </tr>

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

                    <div style="margin-top:25px; border:1px solid #eee; border-radius:8px; padding:20px; background:#fafafa;">
                      <h3 style="margin-top:0; color:#2c3e50;">Order Summary</h3>

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

                      <div style="color:black; margin-top:15px; text-align:right; font-size:16px;">
                        <strong>Total Paid: ₦${(expectedTotal / 100).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div style="margin-top:20px; font-size:13px; color:#777;">
                      <p><strong>Transaction ID:</strong> ${transactionId}</p>
                      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                    </div>

                  </td>
                </tr>

                <tr>
                  <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#888;">
                    <p style="margin:0;">Thank you for shopping with us</p>
                    <p style="margin:5px 0 0;">© ${new Date().getFullYear()} MumsNeeds. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    // SEND EMAIL
    try {
      await sendEmail(
        customerDetails.email,
        "Payment Confirmation - Order Successful",
        emailHTML
      );
    } catch (emailError) {
      console.error("Email failed but payment succeeded:", emailError.message);
    }

    // CLEAR CART 
    try {
      await axios.delete(
        `https://mums-needs-production.up.railway.app/v1/cartItems/${customerId}`
      );
    } catch (cartError) {
      console.error("Failed to clear cart:", cartError.message);
    }

    return res.json({
      success: true,
      message: "Payment verified, stock updated, cart cleared, and email sent",
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
