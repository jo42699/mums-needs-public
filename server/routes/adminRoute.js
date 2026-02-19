// routes/admin.js
const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middleware/firebaseAuth");
const verifyAdmin = require("../middleware/verify-admin");

// ---------------------------------------------
// ADMIN CHECK (verifies session + UID admin)
// ---------------------------------------------
router.get("/check", firebaseAuth, verifyAdmin, (req, res) => {
  res.json({
    status: "admin_verified",
    user: req.user
  });
});

// ---------------------------------------------
// ADMIN-ONLY DATA EXAMPLE
// ---------------------------------------------
router.get("/data", firebaseAuth, verifyAdmin, (req, res) => {
  res.json({
    secret: "This is admin-only data!",
    timestamp: Date.now()
  });
});

// ---------------------------------------------
// AUTHENTICATED USER PROFILE (no admin needed)
// ---------------------------------------------
router.get("/profile", firebaseAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
