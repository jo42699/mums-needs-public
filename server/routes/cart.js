const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Customer = require('../models/customer');

// CREATE CART
router.post('/', async (req, res) => {
  try {
    const cart = await Cart.create(req.body);
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET CART BY ID
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET CART + CUSTOMER DETAILS (JOIN)
router.get('/:id/details', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('customerId');

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE CART
router.put('/:id', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE / CLEAR CART
router.delete('/:id', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
