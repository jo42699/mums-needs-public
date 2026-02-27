import { API } from "./config/config.js";


document.addEventListener("DOMContentLoaded", async () => {
  const orderNumberEl = document.getElementById("order-number");
  const amountPaidEl = document.getElementById("amount-paid");

  const formatter = new Intl.NumberFormat("en-NG");

  // 1. Get order ID from URL
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order");

  if (!orderId) {
    orderNumberEl.textContent = "Unknown";
    amountPaidEl.textContent = "0";
    return;
  }

  try {
    // 2. Fetch order from backend
    const res = await fetch(`${API}/orders/${orderId}`);
    const data = await res.json();

    if (!data.success || !data.order) {
      orderNumberEl.textContent = "Not Found";
      return;
    }

    const order = data.order;

    // 3. Fill in dynamic values
    orderNumberEl.textContent = order._id;
    amountPaidEl.textContent = "₦" + formatter.format(order.payment.amountPaid);

  } catch (err) {
    console.error("Error loading order:", err);
    orderNumberEl.textContent = "Error";
  }
});
