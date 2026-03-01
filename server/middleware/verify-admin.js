
const { admins } = require("../config/admin");

const verifyAdmin = (req, res, next) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!admins.includes(uid)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin verification failed:", error);
    return res.status(500).json({ error: "Server error verifying admin" });
  }
};

module.exports = verifyAdmin;
