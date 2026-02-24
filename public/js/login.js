// ================= IMPORTS =================
import { 
  auth, 
  loginWithEmail, 
  loginWithGoogle, 
  resetPassword, 
  logout,
  signupWithEmail,
  onAuthStateChanged
} from "./auth.js";

import { handleLoginMerge } from "./cart.js";


// ================= MAIN =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= DOM ELEMENTS =================
  const emailForm = document.getElementById("email-login-form");
  const signupForm = document.getElementById("email-signup-form");
  const googleSigninBtn = document.getElementById("googleSigninBtn");
  const googleSignupBtn = document.getElementById("googleSignupBtn");
  const goToSignup = document.getElementById("goToSignup");
  const goToSignin = document.getElementById("goToSignin");
  const forgotPassword = document.getElementById("forgotPasswordLink");
  const signInPanel = document.getElementById("signInPanel");
  const signUpPanel = document.getElementById("signUpPanel");
  const authContainer = document.querySelector(".auth-container");
  const loggedInContainer = document.getElementById("loggedInContainer");
  const logoutBtn = document.getElementById("logoutBtn");


  // ================= PANEL TOGGLE =================
  goToSignup?.addEventListener("click", (e) => {
    e.preventDefault();
    signInPanel.classList.remove("active");
    signUpPanel.classList.add("active");
  });

  goToSignin?.addEventListener("click", (e) => {
    e.preventDefault();
    signUpPanel.classList.remove("active");
    signInPanel.classList.add("active");
  });


  // ================= EMAIL LOGIN =================
  emailForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
      await loginWithEmail(email, password);

      const idToken = await auth.currentUser.getIdToken(true);
      console.log("ID TOKEN (email login):", idToken);

      const res = await fetch("http://localhost:5000/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (res.ok) console.log("SESSION COOKIE SET (email login)");

      showLoggedInUI(auth.currentUser);
    } catch (err) {
      alert(err.message);
    }
  });


  // ================= EMAIL SIGNUP =================
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmailInput").value;
    const password = document.getElementById("signupPasswordInput").value;

    try {
      await signupWithEmail(email, password);

      const idToken = await auth.currentUser.getIdToken(true);
      console.log("ID TOKEN (signup):", idToken);

      const res = await fetch("http://localhost:5000/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (res.ok) console.log("SESSION COOKIE SET (signup)");

      showLoggedInUI(auth.currentUser);
    } catch (err) {
      alert(err.message);
    }
  });


  // ================= GOOGLE LOGIN/SIGNUP =================
  async function handleGoogleAuth(button) {
    button.disabled = true;
    try {
      await loginWithGoogle();

      const idToken = await auth.currentUser.getIdToken(true);
      console.log("ID TOKEN (Google login):", idToken);

      const res = await fetch("http://localhost:5000/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (res.ok) console.log("SESSION COOKIE SET (Google login)");

      showLoggedInUI(auth.currentUser);
    } catch (err) {
      if (err.code === "auth/cancelled-popup-request") {
        alert("Google login cancelled. Try again.");
      } else if (err.code === "auth/popup-closed-by-user") {
        alert("Popup closed before login. Try again.");
      } else {
        console.error(err);
        alert(err.message);
      }
    } finally {
      button.disabled = false;
    }
  }

  googleSigninBtn?.addEventListener("click", () => handleGoogleAuth(googleSigninBtn));
  googleSignupBtn?.addEventListener("click", () => handleGoogleAuth(googleSignupBtn));


  // ================= FORGOT PASSWORD =================
  forgotPassword?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;

    if (!email) {
      alert("Enter your email first");
      return;
    }

    try {
      await resetPassword(email);
      alert("Password reset email sent!");
    } catch (err) {
      alert(err.message);
    }
  });


  // ================= LOGOUT =================
  logoutBtn?.addEventListener("click", async () => {
    try {
      await logout();

      const res = await fetch("http://localhost:5000/v1/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) console.log("SESSION COOKIE CLEARED (logout)");

      authContainer.style.display = "flex";
      loggedInContainer.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("Failed to logout");
    }
  });


  // ================= HELPER: SHOW LOGGED-IN UI =================
  function showLoggedInUI(user) {
    authContainer.style.display = "none";
    loggedInContainer.style.display = "block";

    if (user?.email) {
      loggedInContainer.querySelector("p").textContent =
        "You are successfully logged in!";
    }
  }


 // ================= CHECK AUTH STATE ON LOAD =================
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await handleLoginMerge(user.uid);
      showLoggedInUI(user);
    } else {
      authContainer.style.display = "flex";
      loggedInContainer.style.display = "none";
    }
  });

});
