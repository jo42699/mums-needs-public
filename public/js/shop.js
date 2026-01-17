const container = document.getElementById('productContainer');
const apiURL = 'http://localhost:5000/v1/product/';
const nairaFormatter = new Intl.NumberFormat("en-NG");

let allProducts = []; // store backend products

//LOAD PRODUCTS 
async function loadProducts() {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`Network Error: ${response.status}`);

    const products = await response.json();
    console.log("Loaded products:", products);

    allProducts = products;          // store for filtering
    renderProducts(products);        // initial render

  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

//RENDER PRODUCTS 
function renderProducts(products) {
  container.innerHTML = "";

  products.forEach(product => {
    const imgURL = `http://localhost:5000${product.image.url}`;
    const priceInNaira = product.price / 100;
    const discountInNaira = product.discount / 100;

    container.innerHTML += `
      <div class="product text-center" data-id="${product._id}">
        <img src="${imgURL}" alt="${product.image.alt || product.name}" class="img-fluid">
        <h5 class="p-name">${product.name}</h5>
        <h4 class="p-price">₦ ${nairaFormatter.format(priceInNaira)}</h4>
        <h5 class="discount-price">₦ ${nairaFormatter.format(discountInNaira)}</h5>
      </div>
    `;
  });

  initPagination(); // re-run pagination after rendering
}

/* ---------------- FILTER PRODUCTS ---------------- */
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

/* ---------------- PAGINATION ---------------- */
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

/* ---------------- SEARCH INPUTS ---------------- */
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

//RUN EVERYTHING 
(async () => {
  await loadProducts();
})();

// CART COUNT 
const cartCountEl = document.querySelector(".cart-count");
let cartCount = Number(localStorage.getItem("cartCount")) || 0;
cartCountEl.textContent = cartCount;

function addToCart() {
  cartCount += 1;
  cartCountEl.textContent = cartCount;
  localStorage.setItem("cartCount", cartCount);
}

// ADD TO CART BUTTON 
document.addEventListener("click", e => {
  if (e.target.classList.contains("addToCart-Btn")) {
    e.stopPropagation();
    addToCart();
  }
});

// PRODUCT CLICK to  DETAILS PAGE 
container.addEventListener("click", e => {
  const card = e.target.closest(".product");
  if (!card) return;

  const id = card.dataset.id;
  window.location.href = `product.html?id=${id}`;
});
