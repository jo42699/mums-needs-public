const mongoose = require('mongoose');

// PAYMENT SCHEMA   
const PaymentSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: ["card", "paystack", "paypal", "bank_transfer"],
      required: true
    },
    paymentStatus: { type: Boolean, default: false },
    amountPaid: { type: Number, required: true },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
);




module.exports = mongoose.model('Payment', PaymentSchema);