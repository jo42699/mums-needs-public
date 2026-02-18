const apiURL = "http://localhost:5000/v1/product/";
const naira = new Intl.NumberFormat("en-NG");

// Home page sections
const section1 = document.getElementById("section1");
const section2 = document.getElementById("section2");
const section3 = document.getElementById("section3");
const shopSection = document.getElementById("productContainer"); 

// Load products for home page
async function loadHomeProducts() {
  try {
    const res = await fetch(apiURL);
    const products = await res.json();

    renderHomeSections(products);

  } catch (err) {
    console.error("Error loading home products:", err);
  }
}

// Render products into home page sections
function renderHomeSections(products) {
  if (section1) section1.innerHTML = "";
  if (section2) section2.innerHTML = "";
  if (section3) section3.innerHTML = "";
  if (shopSection) shopSection.innerHTML = "";

  products.forEach(product => {
    const imgURL = `http://localhost:5000${product.image.url}`;
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

    // Homepage sections
    if (product.section === "section1" && section1) section1.innerHTML += card;
    if (product.section === "section2" && section2) section2.innerHTML += card;
    if (product.section === "section3" && section3) section3.innerHTML += card;
    if (product.section === "shop" && shopSection) shopSection.innerHTML += card;
  });

  // Make cards clickable EXCEPT shop section cards
  document.querySelectorAll(".product").forEach(card => {
    const insideShop = card.closest("#productContainer");

    // If card is inside shop section → do nothing
    if (insideShop) return;

    // Otherwise, make it clickable
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}


loadHomeProducts();
