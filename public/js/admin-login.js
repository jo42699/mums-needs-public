import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsa7fMMu-ddRAsVK_CysTWzyyBexIjs4k",
  authDomain: "mums-needs-b074d.firebaseapp.com",
  projectId: "mums-needs-b074d",
  storageBucket: "mums-needs-b074d.firebasestorage.app",
  messagingSenderId: "537549708674",
  appId: "1:537549708674:web:6543e06602bf369a82c39b",
  measurementId: "G-NW1DMDXKYB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Get Firebase ID token
      const idToken = await getIdToken(userCred.user, true);

      // Send token to backend to create session cookie
      const loginRes = await fetch("http://127.0.0.1:5000/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (!loginRes.ok) {
        throw new Error("Failed to create session cookie");
      }

      // Check admin status
      const adminCheck = await fetch("http://127.0.0.1:5000/v1/admin/check", {
        credentials: "include"
      });

      const adminData = await adminCheck.json();

      if (!adminCheck.ok) {
        throw new Error(adminData.error || "Not an admin");
      }

      // Redirect to dashboard
      window.location.href = "/admin-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Admin login failed: " + err.message);
    }
  });
});
