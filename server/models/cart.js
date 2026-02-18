const mongoose = require('mongoose');
const CartItemSchema = require('../models/cart-Item.js');

const CartSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,   // ⭐ FIXED: Firebase UID is a string
      required: true,
      unique: true
    },

    cartItems: [CartItemSchema],

    cartTotal: {
      type: Number,
      default: 0
    },

    currency: {
      type: String,
      default: "NGN"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
