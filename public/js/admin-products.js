import { API } from "./config/config.js";
import {API_URL} from "./config/config.js";


const apiURL = `${API}/product/`;
const tableBody = document.querySelector("tbody");
const productCountEl = document.querySelector(".section-header span");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("productSearch"); 

// Drawer elements
const drawer = document.getElementById("orderDrawer");
const closeDrawer = document.getElementById("closeDrawer");
const drawerDeleteBtn = document.getElementById("drawerDeleteBtn");

let allProducts = [];
let currentPage = 1;
let currentProduct = null;
const productsPerPage = 10;


//   FETCH PRODUCTS

async function loadAdminProducts() {
  try {
    const res = await fetch(apiURL);
    const products = await res.json();

    allProducts = products;
    productCountEl.textContent = products.length;

    renderPage(currentPage);
    renderPagination();

  } catch (err) {
    console.error("Error loading admin products:", err);
  }
}


  // RENDER PAGE RENDER ALL THE PRODUCTS WITH PAGINATION and correct PRICE LOGIC

function renderPage(page) {
  tableBody.innerHTML = "";

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;

  const pageProducts = allProducts.slice(start, end);

  pageProducts.forEach(product => {
    const imgURL = `${product.image.url}`;
    const price = product.price / 100;

    const inStock = Object.values(product.stockBySize).some(qty => qty > 0);

    tableBody.innerHTML += `
      <tr class="product-row" data-id="${product._id}">
        <td>
          <div class="product-info">
            <div class="product-image">
              <img src="${imgURL}" alt="">
            </div>
            <span class="product-name">${product.name}</span>
          </div>
        </td>

        <td>#${product._id.slice(-6)}</td>

        <td>
          <span class="stock ${inStock ? "in-stock" : "out-of-stock"}">
            ${inStock ? "In Stock" : "Out of Stock"}
          </span>
        </td>

        <td>₦ ${price.toLocaleString()}</td>

        <td>
          <button class="action-btn delete-btn">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>

        <td>
          <button class="action-btn open-btn">View</button>
        </td>
      </tr>
    `;
  });

  attachEvents(pageProducts);
}


 //  PAGINATION

function renderPagination() {
  paginationEl.innerHTML = "";

  const totalPages = Math.ceil(allProducts.length / productsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";

    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage(currentPage);
      renderPagination();
    });

    paginationEl.appendChild(btn);
  }
}


  // SEARCH FILTER FOR THE PRODUCTS 

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  if (query === "") {
    currentPage = 1;
    renderPage(currentPage);
    renderPagination();
    return;
  }

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p._id.toLowerCase().includes(query) ||
    (p.section && p.section.toLowerCase().includes(query))
  );

  currentPage = 1;
  renderFiltered(filtered);
  renderFilteredPagination(filtered);
});

function renderFiltered(products) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  const pageProducts = products.slice(start, end);

  pageProducts.forEach(product => {
    const imgURL = `${API_URL}${product.image.url}`;
    const price = product.price / 100;
    const inStock = Object.values(product.stockBySize).some(qty => qty > 0);

    tableBody.innerHTML += `
      <tr class="product-row" data-id="${product._id}">
        <td>
          <div class="product-info">
            <div class="product-image">
              <img src="${imgURL}" alt="">
            </div>
            <span class="product-name">${product.name}</span>
          </div>
        </td>

        <td>#${product._id.slice(-6)}</td>

        <td>
          <span class="stock ${inStock ? "in-stock" : "out-of-stock"}">
            ${inStock ? "In Stock" : "Out of Stock"}
          </span>
        </td>

        <td>₦ ${price.toLocaleString()}</td>

        <td>
          <button class="action-btn delete-btn">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>

        <td>
          <button class="action-btn open-btn">View</button>
        </td>
      </tr>
    `;
  });

  attachEvents(pageProducts);
}

function renderFilteredPagination(products) {
  paginationEl.innerHTML = "";

  const totalPages = Math.ceil(products.length / productsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";

    btn.addEventListener("click", () => {
      currentPage = i;
      renderFiltered(products);
      renderFilteredPagination(products);
    });

    paginationEl.appendChild(btn);
  }
}


  // ATTACH EVENTS

function attachEvents(products) {
  document.querySelectorAll(".open-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const row = e.target.closest(".product-row");
      const id = row.dataset.id;

      const product = products.find(p => p._id === id);
      openDrawer(product);
    });
  });

  // DELETE BUTTONS
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const row = e.target.closest(".product-row");
      const id = row.dataset.id;

      if (!confirm("Are you sure you want to delete this product ?")) return;

      try {
        await fetch(`${apiURL}${id}`, { method: "DELETE" });
        row.remove();

        allProducts = allProducts.filter(p => p._id !== id);
        productCountEl.textContent = allProducts.length;

        renderPage(currentPage);
        renderPagination();

      } catch (err) {
        console.error("Delete failed:", err);
      }
    });
  });
}


  // DRAWER LOGIC

function openDrawer(product) {
  currentProduct = product;
  drawer.classList.add("open");

  drawer.querySelector(".drawer-header span").textContent = product.name;

  // MAIN PRODUCT STOCK
  const mainStockBody = drawer.querySelectorAll(".stock-table tbody")[0];
  mainStockBody.innerHTML = "";

  Object.entries(product.stockBySize).forEach(([size, qty]) => {
    mainStockBody.innerHTML += `
      <tr>
        <td>${size}</td>
        <td>${qty}</td>
      </tr>
    `;
  });

  // MAIN PRODUCT IMAGE
  const mainImg = drawer.querySelector(".drawer-items img");
  mainImg.src = `${API_URL}${product.image.url}`;
  mainImg.alt = product.image.alt;

  // VARIANTS SECTION
  const variantsContainer = drawer.querySelector(".variants-container");
  variantsContainer.innerHTML = ""; 

  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((variant, index) => {
      const variantHTML = `
        <div class="variant-block">
          <h4>Variant ${index + 1}: ${variant.VariantName || ""}</h4>

          <div class="drawer-item">
          </br>
            <img src="${API_URL}${variant.Variantimage.url}" 
                 alt="${variant.Variantimage.alt}">
          </div>

          <table class="stock-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(variant.VariantStockBySize)
                .map(([size, qty]) => `
                  <tr>
                    <td>${size}</td>
                    <td>${qty}</td>
                  </tr>
                `)
                .join("")}
            </tbody>
          </table>
        </div>
        </br>
      `;

      variantsContainer.innerHTML += variantHTML;
    });
  } else {
    variantsContainer.innerHTML = `<p>No variants available</p>`;
  }

  // PRICE
  drawer.querySelector("p strong").nextSibling.textContent =
    ` ₦ ${ (product.price / 100).toLocaleString() }`;
}

closeDrawer.addEventListener("click", () => {
  drawer.classList.remove("open");
});















  // DELETE FROM DRAWER

drawerDeleteBtn.addEventListener("click", async () => {
  if (!currentProduct) return;

  if (!confirm("Are you sure you want to delete this product ?")) return;

  try {
    await fetch(`${apiURL}${currentProduct._id}`, { method: "DELETE" });

    allProducts = allProducts.filter(p => p._id !== currentProduct._id);
    productCountEl.textContent = allProducts.length;

    renderPage(currentPage);
    renderPagination();

    drawer.classList.remove("open");
    currentProduct = null;

  } catch (err) {
    console.error("Delete from drawer failed:", err);
  }
});


 //  RUN

loadAdminProducts();
