const admin = require("firebase-admin");
const serviceAccount = require("../mums-needs-b074d-firebase-adminsdk-fbsvc-f09210c94e.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firebaseAuthMiddleware = (requireAdmin = false) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }

      const idToken = authHeader.split(" ")[1];

      const decodedToken = await admin.auth().verifyIdToken(idToken, true);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || decodedToken.customClaims?.role,
      };

      if (requireAdmin && req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};

module.exports = { firebaseAuthMiddleware, admin };
