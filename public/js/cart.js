import { auth } from "./auth.js"; // Firebase Auth instance

// DOM ELEMENTS
const cartContainer = document.getElementById("cartContainer");
const cartItemsDiv = document.getElementById("cart-items");

// FORMATTER FOR NAIRA DISPLAY
const formatter = new Intl.NumberFormat("en-NG");

// UPDATE CART COUNT (NAV)
function updateCartCount(count) {
  const countEl = document.getElementById("cart-count");
  const addedEl = document.getElementById("added-to-cart");

  if (countEl) countEl.textContent = count;
  if (addedEl) addedEl.textContent = count;
}

// GLOBAL CART COUNT EXPORT (USED BY NAVBAR)
export function getCartCount() {
  const user = auth.currentUser;

  if (!user) {
    const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];
    return guestCart.length;
  }

  const stored = JSON.parse(sessionStorage.getItem("user_cart_count"));
  return stored || 0;
}

// LOAD CART (ALWAYS UPDATES SESSION STORAGE)
export async function loadCart() {
  const user = auth.currentUser;

  if (!cartContainer) return;

  if (!user) {
    const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];
    renderCart(guestCart, false);

    sessionStorage.setItem("user_cart_count", guestCart.length);
    updateCartCount(guestCart.length);
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/v1/cartItems/user/${user.uid}`, {
      credentials: "include"
    });

    const cart = await res.json();
    const items = cart.cartItems || [];

    renderCart(items, true);

    sessionStorage.setItem("user_cart_count", items.length);
    updateCartCount(items.length);

  } catch (err) {
    console.error("Error loading cart:", err);
  }
}

// RENDER CART
function renderCart(items, isUserCart) {
  cartItemsDiv.innerHTML = "";

  if (!items || items.length === 0) {
    cartItemsDiv.innerHTML = `<p>Your cart is empty :( </p>`;
    updateSummary([]);
    updateCartCount(0);
    return;
  }

  items.forEach(item => {
    const imgURL = item.image.url.startsWith("http")
      ? item.image.url
      : `http://localhost:5000${item.image.url}`;

    const itemHTML = `
      <div class="cart-item">
        <img src="${imgURL}" alt="${item.name}">

        <div class="item-info">
          <h4>${item.name}</h4>
          ${item.variantName ? `<p>Variant: ${item.variantName}</p>` : ""}
          <p>Size: ${item.size}</p>
          <p>Quantity: <span>${item.quantity}</span></p>
          <span class="price">₦ ${formatter.format(item.unitPrice / 100)}</span>
        </div>

        <div class="item-actions">
          <i class="fa-solid fa-trash" onclick="deleteCartItem('${item._id}', ${isUserCart})"></i>
        </div>
      </div>
    `;

    cartItemsDiv.innerHTML += itemHTML;
  });

  updateSummary(items);
  updateCartCount(items.length);
}

// UPDATE ORDER SUMMARY
function updateSummary(items) {
  const addedtoCart = document.getElementById("added-to-cart");
  const checkoutCount = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("subtotalAmount");
  const shippingEl = document.getElementById("shippingAmount");
  const totalEl = document.getElementById("totalAmount");

  if (!addedtoCart || !checkoutCount || !subtotalEl || !shippingEl || !totalEl) return;

  const itemCount = items.length;
  addedtoCart.textContent = itemCount;
  checkoutCount.textContent = itemCount;

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.unitPrice ? item.unitPrice / 100 : 0;
    const quantity = item.quantity || 1;
    return sum + unitPrice * quantity;
  }, 0);

  const shipping = itemCount > 0 ? 4000 : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = `₦ ${formatter.format(subtotal)}`;
  shippingEl.textContent = `₦ ${formatter.format(shipping)}`;
  totalEl.textContent = `₦ ${formatter.format(total)}`;
}

// DELETE CART ITEM
window.deleteCartItem = async function (itemId, isUserCart) {
  const user = auth.currentUser;

  if (!isUserCart) {
    let guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];
    guestCart = guestCart.filter(i => i._id !== itemId);
    localStorage.setItem("guest_cart", JSON.stringify(guestCart));

    renderCart(guestCart, false);
    updateCartCount(guestCart.length);

    sessionStorage.setItem("user_cart_count", guestCart.length);
    return;
  }

  try {
    await fetch(`http://localhost:5000/v1/cartItems/${user.uid}/item/${itemId}`, {
      method: "DELETE",
      credentials: "include"
    });

    loadCart();

  } catch (err) {
    console.error("Error deleting item:", err);
  }
};

// MERGE GUEST CART → USER CART
export async function handleLoginMerge(userId) {
  try {
    const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];
    if (guestCart.length === 0) return;

    const fixedCart = guestCart.map(item => ({
      ...item,
      totalPrice: item.unitPrice * item.quantity,
      image: typeof item.image === "string" ? { url: item.image } : item.image,
      variantId: item.variantId || null,
      variantName: item.variantName || null
    }));

    await fetch(`http://localhost:5000/v1/cartItems/merge/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cartItems: fixedCart })
    });

    localStorage.removeItem("guest_cart");

  } catch (error) {
    console.error("Error merging guest cart:", error);
  }
}

// AUTO-LOAD CART ON PAGE LOAD
auth.onAuthStateChanged(() => {
  const el = document.getElementById("added-to-cart");
  if (!el) return;
  el.textContent = getCartCount();

  loadCart();
});
