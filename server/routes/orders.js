// routes/order.js
const express = require("express");
const Order = require("../models/order");

const router = express.Router();

/**
 * GET ALL ORDERS (Newest First)
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("customer", "name email");

    return res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});




// GET ORDER BY ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
});



// DELETE ORDER BY ID
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message
    });
  }
});



module.exports = router;
