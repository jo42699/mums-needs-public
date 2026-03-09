// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { API} from "./config/config.js";

// Firebase config
const firebaseConfig = {
  apiKey: "##########################################",
  authDomain: "###########################################",
  projectId: "##########################################",
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Backend session helpers
async function createSession(idToken) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create session");
}

async function destroySession() {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

// Email login
async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken(true);
  await createSession(token);
}

// Email signup
async function signupWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken(true);
  await createSession(token);
}

// Google login/signup
async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken(true);
  await createSession(token);
}

// Reset password
async function resetPassword(email) {
  if (!email) throw new Error("Enter your email first");
  await sendPasswordResetEmail(auth, email);
}

// Logout
async function logout() {
  await destroySession();
  await auth.signOut();
}

// Exports
export {
  auth,
  googleProvider,
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  resetPassword,
  logout,
  createSession,
  destroySession,
  onAuthStateChanged,
};
