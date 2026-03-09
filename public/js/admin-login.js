import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { API } from "./config/config.js";





// Firebase config
const firebaseConfig = {
  apiKey: "##########################################",
  authDomain: "###########################################",
  projectId: "##########################################",
  storageBucket: "#######################################3##",
  messagingSenderId: "#########################################",
  appId: "############################################",
  measurementId: "###############"
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

      //   ID token
      const idToken = await userCred.user.getIdToken(true);

      //  Send token to backend to create session cookie
      const loginRes = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (!loginRes.ok) throw new Error("Failed to create session cookie");

      
      await new Promise(resolve => setTimeout(resolve, 150));

      // Verify admin
      const adminCheck = await fetch(`${API}/admin/check`, {
        credentials: "include"
      });

      const adminData = await adminCheck.json();
      if (!adminCheck.ok) throw new Error(adminData.error || "Not an admin");

      console.log("Admin verified:", adminData);

      //  Redirect to dashboard 
      window.location.href = "/admin-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Admin login failed: " + err.message);
    }
  });
});

// LOGOUT HANDLER 
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; 

  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API}/auth/logout`, {
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
