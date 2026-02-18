const mongoose = require('mongoose');

// PAYMENT SCHEMA   
const PaymentSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "cash"],
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