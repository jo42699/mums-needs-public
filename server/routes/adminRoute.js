// routes/admin.js
const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middleware/firebaseAuth");
const verifyAdmin = require("../middleware/verify-admin");


// ADMIN CHECK 

router.get("/check", firebaseAuth, verifyAdmin, (req, res) => {
  res.json({
    status: "admin_verified",
    user: req.user
  });
});




router.get("/data", firebaseAuth, verifyAdmin, (req, res) => {
  res.json({
    secret: "This is admin-only data!",
    timestamp: Date.now()
  });
});

// add more admin routes here as needed, all protected by firebaseAuth + verifyAdmin
router.get("/profile", firebaseAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
