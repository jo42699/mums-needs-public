const express = require('express');
const Cart = require('../models/cart.js');
const router = express.Router();

// Get all carts (for testing/admin purposes)
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart by customer ID
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

    // Recalculate subtotal
    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Add ₦2000 shipping (200000 kobo)
    const shipping = subtotal > 0 ? 200000 : 0;

    cart.cartTotal = subtotal + shipping;

    // Save updated total
    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/*
|--------------------------------------------------------------------------
| ADD ITEM TO CART
|--------------------------------------------------------------------------
*/
router.post('/add', async (req, res) => {
  try {
    const { customerId, productId, quantity, size, name, unitPrice, image } = req.body;

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = new Cart({
        customerId,
        cartItems: [],
        cartTotal: 0
      });
    }

    cart.cartItems.push({
      productId,
      quantity,
      size,
      name,
      unitPrice,
      totalPrice: unitPrice * quantity,
      image
    });

    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 200000 : 0; // ₦2000 in kobo

    cart.cartTotal = subtotal + shipping;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/
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
      item.totalPrice = item.unitPrice * quantity;
    }

    if (size !== undefined) {
      item.size = size;
    }

    const subtotal = cart.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 200000 : 0;

    cart.cartTotal = subtotal + shipping;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/*
|--------------------------------------------------------------------------
| DELETE CART ITEM
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| MERGE GUEST CART → USER CART
|--------------------------------------------------------------------------
*/
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

    cart.cartItems = cartItems;

    cart.cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

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
