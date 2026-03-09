import { API } from "./config/config.js";
import { API_URL } from "./config/config.js"; // NOT USED YET, BUT MAYBE LATER FOR IMAGE URLS OR OTHER ASSETS

const apiURL = `${API}/product/`;
const naira = new Intl.NumberFormat("en-NG");

const section1 = document.getElementById("section1");
const section2 = document.getElementById("section2");
const section3 = document.getElementById("section3");
const shopSection = document.getElementById("productContainer");

async function loadHomeProducts() {
  try {
    const res = await fetch(apiURL);
    const products = await res.json();

    renderHomeSections(products);
  } catch (err) {
    console.error("Error loading home products:", err);
  }
}

function renderHomeSections(products) {
  if (section1) section1.innerHTML = "";
  if (section2) section2.innerHTML = "";
  if (section3) section3.innerHTML = "";
  if (shopSection) shopSection.innerHTML = "";

  products.forEach(product => {
    const hasStock = Object.values(product.stockBySize || {}).some(qty => qty > 0) ||
                     product.variants.some(v => Object.values(v.VariantStockBySize || {}).some(qty => qty > 0));

    if (!hasStock) return;

    const imgURL = `${product.image.url}`;
    const originalPrice = product.price / 100;

    let discountedPrice = null;
    if (product.discount > 0) {
      discountedPrice = (product.price * (100 - product.discount)) / 10000;
    }

    const card = `
      <div class="product text-center" data-id="${product._id}">
        <img src="${imgURL}" alt="${product.image.alt}">
        <h5 class="p-name">${product.name}</h5>

        <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
          <h4 style="font-size:18px; font-weight:bold; color:#38223f; margin:0;">
            ₦ ${naira.format(discountedPrice ?? originalPrice)}
          </h4>

          ${
            product.discount > 0
              ? `<h5 style="font-size:14px; color:red; text-decoration:line-through; margin:0;">
                   ₦ ${naira.format(originalPrice)}
                 </h5>`
              : ``
          }
        </div>
      </div>
    `;

    if (product.section === "section1" && section1) section1.innerHTML += card;
    if (product.section === "section2" && section2) section2.innerHTML += card;
    if (product.section === "section3" && section3) section3.innerHTML += card;
    if (product.section === "shop" && shopSection) shopSection.innerHTML += card;
  });

  document.querySelectorAll(".product").forEach(card => {
    const insideShop = card.closest("#productContainer");
    if (insideShop) return;

    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

loadHomeProducts();