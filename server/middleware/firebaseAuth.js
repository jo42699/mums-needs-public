// middleware/firebaseAuth.js
const admin = require("firebase-admin");

const firebaseAuth = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies?.session;

    if (!sessionCookie) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      provider: decodedToken.firebase?.sign_in_provider
    };

    next();
  } catch (error) {
    console.error("Firebase session verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};

module.exports = firebaseAuth;
