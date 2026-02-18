// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { firebaseAuthMiddleware, admin } = require("../middleware/verify-admin");

// Admin check
router.get("/admin/check", firebaseAuthMiddleware(true), (req, res) => {
  res.json({ status: "admin_verified", user: req.user });
});

// Promote a user to admin (admin-only)
router.post("/admin/promote", firebaseAuthMiddleware(true), async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role: "admin" });
    res.json({ success: true, message: `User ${uid} is now an admin` });
  } catch (err) {
    console.error("Failed to promote admin:", err);
    res.status(500).json({ error: "Failed to promote user to admin" });
  }
});

// Admin-only example
router.get("/admin-data", firebaseAuthMiddleware(true), (req, res) => {
  res.json({ secret: "This is admin-only data!" });
});

// Authenticated user example
router.get("/profile", firebaseAuthMiddleware(false), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
    