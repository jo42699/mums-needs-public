import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsa7fMMu-ddRAsVK_CysTWzyyBexIjs4k",
  authDomain: "mums-needs-b074d.firebaseapp.com",
  projectId: "mums-needs-b074d",
  storageBucket: "mums-needs-b074d.firebasestorage.app",
  messagingSenderId: "537549708674",
  appId: "1:537549708674:web:6543e06602bf369a82c39b",
  measurementId: "G-NW1DMDXKYB"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// LOGIN HANDLER
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      //  Fresh ID token
      const idToken = await userCred.user.getIdToken(true);

      //  Send token to backend to create session cookie
      const loginRes = await fetch("http://localhost:5000/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (!loginRes.ok) throw new Error("Failed to create session cookie");

      
      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify admin
      const adminCheck = await fetch("http://localhost:5000/v1/admin/check", {
        credentials: "include"
      });

      const adminData = await adminCheck.json();
      if (!adminCheck.ok) throw new Error(adminData.error || "Not an admin");

      console.log("Admin verified:", adminData);

      // 6. Redirect to dashboard (Live Server)
      window.location.href = "/admin-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Admin login failed: " + err.message);
    }
  });
});

// LOGOUT HANDLER (only runs if logoutBtn exists)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; // prevents errors on login page

  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:5000/v1/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();
      console.log("Logout response:", data);

      // Redirect to login page
      window.location.href = "/admin-login.html";

    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
});
