import { auth } from "./auth.js";


const proceedBtn = document.getElementById("proceedToCheckoutBtn");

if (proceedBtn) {
  proceedBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to continue checkout");
      window.location.href = "/login.html";
      return;
    }

    // Fetch the user's cart to get the cartId
    try {
      const res = await fetch(`http://localhost:5000/v1/cartItems/user/${user.uid}`, {
        credentials: "include"
      });

      const cart = await res.json();

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
