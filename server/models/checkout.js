const mongooose = require('mongoose');
const CartItemSchema = require('../models/cart-Item.js');

// CHECKOUT SCHEMA

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    items: [CartItemSchema],

    cartTotal: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    payment: {
      paymentMethod: { type: String },
      paymentStatus: { type: Boolean, default: false },
      amountPaid: { type: Number },
      transactionId: { type: String }
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);



OrderSchema.pre("save", function (next) {
  if (
    this.payment?.paymentStatus === true &&
    this.payment.amountPaid === this.cartTotal
  ) {
    this.orderStatus = "confirmed";
    this.payment.paidAt = this.payment.paidAt || new Date();
  }

  next();
});



module.exports = mongoose.model('Order', OrderSchema);