import { auth } from "./auth.js";

const orderItemsContainer = document.querySelector(".order-item-render");
const subtotalEl = document.querySelector(".summary-line span:nth-child(2)");
const shippingEl = document.querySelector(".summary-line:nth-child(3) span:nth-child(2)");
const totalEl = document.querySelector(".summary-total span:nth-child(2)");

const formatter = new Intl.NumberFormat("en-NG");

// Load order summary when user is authenticated
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please sign in to view your order summary.");
    window.location.href = "/login.html";
    return;
  }

  try {
    // Fetch the user's cart
    const res = await fetch(`http://localhost:5000/v1/cartItems/user/${user.uid}`, {
      credentials: "include"
    });

    const cart = await res.json();

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      orderItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
      return;
    }

    renderOrderItems(cart.cartItems);
    renderSummary(cart.cartItems);

  } catch (err) {
    console.error("Error loading order summary:", err);
  }
});


// Render each cart item in the order summary
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


// Render subtotal, shipping, and total
function renderSummary(items) {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.unitPrice / 100;
    return sum + unitPrice * item.quantity;
  }, 0);

  const shipping = items.length > 0 ? 2000 : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = `₦${formatter.format(subtotal)}`;
  shippingEl.textContent = `₦${formatter.format(shipping)}`;
  totalEl.textContent = `₦${formatter.format(total)}`;
}
