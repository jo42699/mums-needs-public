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

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCsa7fMMu-ddRAsVK_CysTWzyyBexIjs4k",
  authDomain: "mums-needs-b074d.firebaseapp.com",
  projectId: "mums-needs-b074d",
};

// INIT FIREBASE 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

//BACKEND SESSION 
async function createSession(idToken) {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) throw new Error("Failed to create session");
}

async function destroySession() {
  await fetch("http://localhost:5000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

//  AUTH FUNCTIONS 

// Email login
async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  await createSession(token);
}

// Email signup
async function signupWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  await createSession(token);
}

// Google login/signup
async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  await createSession(token);
}

// Reset password
async function resetPassword(email) {
  if (!email) throw new Error("Enter your email first");
  await sendPasswordResetEmail(auth, email);
  alert("Password reset email sent!");
}

// Logout
async function logout() {
  await destroySession();
  await auth.signOut();
}

//  EXPORTS 
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
  onAuthStateChanged,   //
};
