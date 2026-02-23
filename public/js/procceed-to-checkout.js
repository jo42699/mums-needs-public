import { auth } from "./auth.js";

const proceedBtn = document.getElementById("proceedToCheckoutBtn");

if (proceedBtn) {
  proceedBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    // Not logged in → alert + redirect
    if (!user) {
      alert("Almost there! Sign in to complete your checkout 🛍️");
      window.location.href = "/login.html";
      return;
    }

    // Logged in → fetch cart
    try {
      const res = await fetch(`http://localhost:5000/v1/cartItems/user/${user.uid}`, {
        credentials: "include"
      });

      const cart = await res.json();

      // Logged in BUT cart is empty → alert only
      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      // Store cartId for checkout.js
      sessionStorage.setItem("checkout_cartId", cart._id);

      // Redirect to checkout page
      window.location.href = "/checkout.html";

    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  });
}
