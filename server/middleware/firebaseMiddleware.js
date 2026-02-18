const admin = require("firebase-admin");
const serviceAccount = require("../mums-needs-b074d-firebase-adminsdk-fbsvc-f09210c94e.json");

// Initialize Firebase Admin SDK 
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware to verify Firebase session cookie
const firebaseAuthMiddleware = async (req, res, next) => {
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
      provider: decodedToken.firebase?.sign_in_provider,
    };

    next();
  } catch (error) {
    console.error("Firebase session verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};







module.exports = { firebaseAuthMiddleware };
