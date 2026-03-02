const express = require('express');
const Cart = require('../models/cart.js');
const router = express.Router();

//CART ITEM (QUANTITY/SIZE)
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET CART BY CUSTOMER ID
router.get('/user/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(200).json({
        customerId,
        cartItems: [],
        cartTotal: 0
      });
    }

    // subtotal uses discounted totalPrice
    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 400000 : 0;

    cart.cartTotal = subtotal + shipping;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE CART
router.post('/add', async (req, res) => {
  try {
    const {
      customerId,
      productId,
      quantity,
      size,
      name,
      unitPrice,
      image,
      variantId,
      variantName,
      discount,
      discountedPrice
    } = req.body;

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = new Cart({
        customerId,
        cartItems: [],
        cartTotal: 0
      });
    }

    // FIX: use discounted price if discount exists
    const finalUnitPrice = discount > 0 ? discountedPrice : unitPrice;

    cart.cartItems.push({
      productId,
      quantity,
      size,
      name,
      unitPrice,
      image,
      variantId: variantId || null,
      variantName: variantName || null,
      discount: discount || 0,
      discountedPrice: discountedPrice || unitPrice,
      totalPrice: finalUnitPrice * quantity
    });

    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 400000 : 0;

    cart.cartTotal = subtotal + shipping;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE CART ITEM (QUANTITY/SIZE)
router.patch('/:customerId/item/:itemId', async (req, res) => {
  try {
    const { customerId, itemId } = req.params;
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(200).json({ cartItems: [], cartTotal: 0 });
    }

    const item = cart.cartItems.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity !== undefined) {
      item.quantity = quantity;

      // FIX: recalc totalPrice using discounted price
      const finalUnitPrice = item.discount > 0 ? item.discountedPrice : item.unitPrice;
      item.totalPrice = finalUnitPrice * quantity;
    }

    if (size !== undefined) {
      item.size = size;
    }

    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 400000 : 0;

    cart.cartTotal = subtotal + shipping;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE CART ITEM
router.delete('/:customerId/item/:itemId', async (req, res) => {
  try {
    const { customerId, itemId } = req.params;

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(200).json({ cartItems: [], cartTotal: 0 });
    }

    cart.cartItems = cart.cartItems.filter(
      item => item._id.toString() !== itemId
    );

    cart.cartTotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    res.status(200).json({ message: "Item removed", cart });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE / CLEAR CART BY CUSTOMER ID
router.delete('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(200).json({ cartItems: [], cartTotal: 0 });
    }

    cart.cartItems = [];
    cart.cartTotal = 0;

    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MERGE CART (FOR LOGGED IN USERS)
router.put('/merge/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: "cartItems must be an array" });
    }

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = new Cart({
        customerId,
        cartItems: [],
        cartTotal: 0
      });
    }

    // FIX: recalc totalPrice for merged items
    cart.cartItems = cartItems.map(item => {
      const finalUnitPrice = item.discount > 0 ? item.discountedPrice : item.unitPrice;
      return {
        ...item,
        totalPrice: finalUnitPrice * item.quantity
      };
    });

    cart.cartTotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    res.status(200).json({
      message: "Cart merged successfully",
      cart
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
