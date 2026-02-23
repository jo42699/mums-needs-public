import { auth } from "./auth.js";
import { startPayment } from "./paystack.js";

document.addEventListener("DOMContentLoaded", () => {
  const orderItemsContainer = document.querySelector(".order-item-render");
  const totalEl = document.getElementById("summary-subtotal");
  const payBtn = document.getElementById("payNowBtn");

  const formatter = new Intl.NumberFormat("en-NG");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("Please sign in to view your order summary.");
      window.location.href = "/login.html";
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/v1/cartItems/user/${user.uid}`, {
        credentials: "include"
      });

      const cart = await res.json();

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        orderItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
        totalEl.textContent = "₦0";
        return;
      }

      // Store email for Paystack
      window.currentUserEmail = cart.customerDetails.email;

      // ⭐ SUBTOTAL = BACKEND CART TOTAL
      const totalInNaira = cart.cartTotal / 100;
      totalEl.textContent = `₦${formatter.format(totalInNaira)}`;

      // ⭐ This is the Paystack amount
      window.cartTotalInKobo = cart.cartTotal;

      console.log("Cart Total (kobo):", window.cartTotalInKobo);

      renderOrderItems(cart.cartItems);

    } catch (err) {
      console.error("Error loading order summary:", err);
    }
  });

  function renderOrderItems(items) {
    orderItemsContainer.innerHTML = "";

    items.forEach(item => {
      const imgURL = item.image.url.startsWith("http")
        ? item.image.url
        : `http://localhost:5000${item.image.url}`;

      const html = `
        <div class="order-item">
          <img src="${imgURL}" alt="${item.name}">
          <div>
            <p class="product-name">${item.name}</p>
            <p class="product-meta">
              Size: <span>${item.size}</span> • 
              Quantity: <span>${item.quantity}</span>
            </p>
          </div>
          <span class="price">₦${formatter.format(item.unitPrice / 100)}</span>
        </div>
      `;

      orderItemsContainer.innerHTML += html;
    });
  }

  // ⭐ CLICK LISTENER NOW WORKS
  payBtn.addEventListener("click", () => {
    console.log("PAY NOW CLICKED");
    console.log("Email:", window.currentUserEmail);
    console.log("Amount (kobo):", window.cartTotalInKobo);

    startPayment(window.currentUserEmail, window.cartTotalInKobo);
  });
});
