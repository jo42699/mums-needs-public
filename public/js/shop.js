import { API } from "./config/config.js";
import { API_URL } from "./config/config.js";

const container = document.getElementById('productContainer');
const loader = document.getElementById('productLoader'); 
const apiURL = `${API}/product/`;
const nairaFormatter = new Intl.NumberFormat("en-NG");

let allProducts = []; 

async function loadProducts() {
  try {
    loader.style.display = "grid";
    container.style.display = "none";

    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`Network Error: ${response.status}`);

    const products = await response.json();
    allProducts = products;
    renderProducts(products);

    loader.style.display = "none";
    container.style.display = "flex";

  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<p>Failed to load products.</p>';
    loader.style.display = "none";
    container.style.display = "block";
  }
}

function isProductInStock(product) {
  const mainStock = Object.values(product.stockBySize || {})
    .reduce((sum, qty) => sum + qty, 0);

  const variantStock = (product.variants || []).reduce((total, variant) => {
    const qty = Object.values(variant.VariantStockBySize || {})
      .reduce((s, q) => s + q, 0);
    return total + qty;
  }, 0);

  return (mainStock + variantStock) > 0;
}

function renderProducts(products) {
  container.innerHTML = "";

  products.forEach(product => {
    if (!isProductInStock(product)) return;

    const imgURL = `${API_URL}${product.image.url}`;
    const originalPrice = product.price / 100;

    let discountedPrice = null;
    if (product.discount > 0) {
      discountedPrice = (product.price * (100 - product.discount)) / 10000;
    }

    container.innerHTML += `
      <div class="product text-center" data-id="${product._id}">
        <img src="${imgURL}" alt="${product.image.alt || product.name}" class="img-fluid">
        <h5 class="p-name">${product.name}</h5>

        ${
          product.discount > 0
            ? `
              <h4 class="p-price" style="font-size: 19px; color: purple; font-weight:bold;">
                ₦ ${nairaFormatter.format(discountedPrice)}
              </h4>
              <h5 class="old-price" style="font-size: 14px; text-decoration: line-through; color:#888;">
                ₦ ${nairaFormatter.format(originalPrice)}
              </h5>
            `
            : `
              <h4 class="p-price">
                ₦ ${nairaFormatter.format(originalPrice)}
              </h4>
            `
        }
      </div>
    `;
  });

  initPagination();
}

function filterProducts(query) {
  query = query.toLowerCase();

  const filtered = allProducts.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query);
    const descMatch = product.description?.toLowerCase().includes(query);
    const keywordMatch = product.keywords.some(k => k.toLowerCase().includes(query));
    return nameMatch || descMatch || keywordMatch;
  });

  renderProducts(filtered);
}

function initPagination() {
  const products = document.querySelectorAll('.product');
  const productsPerPage = 20;

  const pagination = document.getElementById('pagination');
  pagination.innerHTML = "";

  if (products.length === 0) return;

  let totalPages = Math.ceil(products.length / productsPerPage);
  let currentPage = 1;

  function renderPagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = (i === currentPage) ? "active" : "";
      btn.addEventListener("click", () => showPage(i));
      pagination.appendChild(btn);
    }
  }

  function showPage(page) {
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;

    products.forEach((product, index) => {
      product.style.display = index >= start && index < end ? "block" : "none";
    });

    currentPage = page;
    renderPagination();
  }

  showPage(1);
}

const desktopSearch = document.querySelector("#searchBox input");
const mobileSearch = document.querySelector("#mobileSearch input");

desktopSearch.addEventListener("input", e => filterProducts(e.target.value));
mobileSearch.addEventListener("input", e => filterProducts(e.target.value));

document.getElementById("closeSearch").addEventListener("click", () => {
  desktopSearch.value = "";
  filterProducts("");
});

document.getElementById("closeMobileSearch").addEventListener("click", () => {
  mobileSearch.value = "";
  filterProducts("");
});

(async () => {
  await loadProducts();
})();

const cartCountEl = document.querySelector(".cart-count");
let cartCount = Number(localStorage.getItem("cartCount")) || 0;
cartCountEl.textContent = cartCount;

function addToCart() {
  cartCount += 1;
  cartCountEl.textContent = cartCount;
  localStorage.setItem("cartCount", cartCount);
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("addToCart-Btn")) {
    e.stopPropagation();
    addToCart();
  }
});

container.addEventListener("click", e => {
  const card = e.target.closest(".product");
  if (!card) return;

  const id = card.dataset.id;
  window.location.href = `product.html?id=${id}`;
});
