const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  //  REQUIRED FOR VARIANT STOCK UPDATES
  variantId: {
    type: String,
    default: null
  },

  variantName: {
    type: String,
    default: null
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  size: {
    type: String,
    required: true
  },

  image: {
    url: String,
    alt: String
  },

  name: {
    type: String,
    required: true
  },

  unitPrice: {
    type: Number,
    required: true
  },

  totalPrice: {
    type: Number,
    required: true
  }
});

module.exports = CartItemSchema;



// REQUIRED 
/*
The product Id
The quantity
The size
The image (url and alt text)
The name of the product
The unit price
The total price (unit price multiplied by quantity)



the unit price should multiply the quantity to get the total price
product id should be used to get the image url, alt text, name, and unit price from the products collection




*/