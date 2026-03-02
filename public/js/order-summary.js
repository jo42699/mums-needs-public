import { auth } from "./auth.js";
import { startPayment } from "./paystack.js";
import { API } from "./config/config.js";
import { API_URL } from "./config/config.js";

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
      const res = await fetch(`${API}/cartItems/user/${user.uid}`, {
        credentials: "include"
      });

      const cart = await res.json();

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        orderItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
        totalEl.textContent = "₦0";
        return;
      }

      window.currentUserEmail = cart.customerDetails.email;

      //  Recompute subtotal from discounted prices
      const subtotalInKobo = cart.cartItems.reduce((sum, item) => {
        const hasDiscount = item.discount && item.discount > 0;
        const unit = hasDiscount ? item.discountedPrice : item.unitPrice; 
        return sum + unit * (item.quantity || 1);
      }, 0);

      //  Add shipping (₦4000 = 400000 kobo)
      const shippingInKobo = 400000;

      // Final total
      const totalInKobo = subtotalInKobo + shippingInKobo;

      // Display total
      const totalInNaira = totalInKobo / 100;
      totalEl.textContent = `₦${formatter.format(totalInNaira)}`;

      // Save for Paystack
      window.cartTotalInKobo = totalInKobo;

      renderOrderItems(cart.cartItems);

      payBtn.addEventListener("click", () => {
        const checkoutInfo = JSON.parse(sessionStorage.getItem("checkout_info"));

        if (!checkoutInfo) {
          alert("Missing checkout info. Please go back to checkout.");
          return;
        }

        localStorage.setItem("customerId", user.uid);

        const checkoutDetails = {
          customerDetails: checkoutInfo,
          items: cart.cartItems,
          cartTotal: window.cartTotalInKobo
        };

        localStorage.setItem("checkoutDetails", JSON.stringify(checkoutDetails));

        startPayment(window.currentUserEmail, window.cartTotalInKobo);
      });

    } catch (err) {
      console.error("Error loading order summary:", err);
    }
  });

  function renderOrderItems(items) {
    orderItemsContainer.innerHTML = "";

    items.forEach(item => {
      const imgURL = item.image.url.startsWith("http")
        ? item.image.url
        : `${API_URL}${item.image.url}`;

      const hasDiscount = item.discount && item.discount > 0;
      const finalNaira = hasDiscount
        ? item.discountedPrice / 100
        : item.unitPrice / 100;

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
          <span class="price">₦${formatter.format(finalNaira)}</span>
        </div>
      `;

      orderItemsContainer.innerHTML += html;
    });
  }
});
