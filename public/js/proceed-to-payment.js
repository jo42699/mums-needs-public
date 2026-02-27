import { auth } from "./auth.js";
import { API } from "./config/config.js";


const form = document.querySelector(".checkout-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    // 1. Must be logged in
    if (!user) {
      alert("Please sign in to continue your checkout.");
      window.location.href = "/login.html";
      return;
    }

    // 2. Fetch cart to ensure it's not empty
    let cart;
    try {
      const res = await fetch(`${API}/cartItems/user/${user.uid}`, {
        credentials: "include"
      });

      cart = await res.json();

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      return;
    }

    // 3. Collect checkout form data
    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!fullname || !phone || !email || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    // 4. Build customerDetails object
    const customerDetails = {
      name: fullname,
      email: email,
      address: location,
      phone: phone
    };

    // 5. Update customer details in the cart
    try {
      await fetch(`${API}/cart/${cart._id}/customer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ customerDetails })
      });
    } catch (err) {
      console.error("Error updating customer details:", err);
    }

    // 6. Save checkout info locally
    sessionStorage.setItem("checkout_info", JSON.stringify(customerDetails));

    // 7. Save cartId for payment page
    sessionStorage.setItem("checkout_cartId", cart._id);

    // 8. Redirect to final payment page
    window.location.href = "/order-summary.html";
  });
}
