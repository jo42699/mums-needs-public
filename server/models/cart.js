const mongoose = require('mongoose');
const CartItemSchema = require('../models/cart-Item.js');

const CartSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,   
      required: true,
      unique: true
    },

    //  Full customer details stored inside the cart
    customerDetails: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      address: { type: String, required: false },
      phone: { type: String, required: false }
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
