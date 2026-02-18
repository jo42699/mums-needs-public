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
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // ⭐ UID is automatically here — you do NOT paste it:
      // userCred.user.uid

      const idToken = await getIdToken(userCred.user, true);

      const adminCheck = await fetch("http://localhost:5000/v1/admin/check", {
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });

      const adminData = await adminCheck.json().catch(() => ({}));

      if (!adminCheck.ok) {
        throw new Error(adminData.error || "Not an admin");
      }

      window.location.href = "/admin-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Admin login failed: " + err.message);
    }
  });
});
