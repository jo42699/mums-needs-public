const mongoose = require('mongoose');
const CartItemSchema = require('./cart-Item.js');

// ORDER SCHEMA
const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true
    },

    // Customer details from checkout page
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true }
    },

    // Items purchased
    items: [CartItemSchema],

    // (subtotal + shipping already included)
    cartTotal: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    // Payment info
    payment: {
      paymentMethod: { type: String },
      paymentStatus: { type: Boolean, default: false },
      amountPaid: { type: Number },
      transactionId: { type: String },
      paidAt: { type: Date }
    },

    // Order status
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// Auto-confirm order when payment is successful
OrderSchema.pre("save", function () {
  if (
    this.payment?.paymentStatus === true &&
    this.payment.amountPaid === this.cartTotal
  ) {
    this.orderStatus = "confirmed";
    this.payment.paidAt = this.payment.paidAt || new Date();
  }
});


module.exports = mongoose.model('Order', OrderSchema);
