import { auth } from "./auth.js";
import { API_URL } from "./config/config.js";

// ELEMENT REFERENCES
const mainImage = document.getElementById("mainImage");
const smallImgGroup = document.getElementById("variantImages");
const productTitle = document.querySelector(".product-title");
const productPrice = document.querySelector(".product-price");
const discountPrice = document.querySelector(".discount-price-card");
const priceSelect = document.getElementById("price-select");
const sizeSelect = document.getElementById("size-select");
const qtyControl = document.querySelector(".qty-control");
const qtyInput = qtyControl.querySelector(".qty-input");
const qtyMinus = qtyControl.querySelector(".qty-minus");
const qtyPlus = qtyControl.querySelector(".qty-plus");
const productDescription = document.querySelector(".product-description");
const addToCartBtn = document.querySelector(".add-to-cart-btn");

// FORMATTER
const formatter = new Intl.NumberFormat("en-NG");

// PRODUCT ID
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Helper: total stock
function getTotalStock(stockObj) {
  return Object.values(stockObj || {}).reduce((sum, qty) => sum + qty, 0);
}

// LOAD PRODUCT DETAILS
async function loadProduct() {
  try {
    const res = await fetch(`${API_URL}/v1/product/${productId}`);
    const product = await res.json();

    window.currentProduct = product;

    const baseStock = getTotalStock(product.stockBySize);
    const variantStock = product.variants.reduce((sum, v) => {
      return sum + getTotalStock(v.VariantStockBySize);
    }, 0);

    //  if base product is out of stock but variants exist
    if (baseStock === 0 && variantStock > 0) {
      alert("The main product is out of stock. Please select a variant.");
    }

    // EXISTING: Alert + replace page if EVERYTHING is out of stock
    if (baseStock + variantStock === 0) {
      alert("This product is out of stock");
      
      document.querySelector(".product-page").innerHTML =
        "<p>This product is out of stock.</p>";
      return;
    }

    // MAIN IMAGE
    mainImage.src = product.image.url;
    mainImage.alt = product.image.alt;

    // TITLE + DESCRIPTION
    productTitle.textContent = product.name;
    productDescription.textContent = product.description;

    // PRICE + DISCOUNT
    const originalPrice = product.price / 100;

    if (product.discount > 0) {
      const discountedPrice =
        (product.price * (100 - product.discount)) / 10000;

      productPrice.innerHTML = `
        <span style="font-size: 18px; text-decoration: line-through; color: #ed0808; display:block;">
          ₦ ${formatter.format(originalPrice)}
        </span>
        <span style="color: #1d1420; font-weight: bold; display:block;">
          ₦ ${formatter.format(discountedPrice)}
        </span>
      `;

      discountPrice.textContent = `${product.discount}% OFF`;
      discountPrice.style.display = "inline-block";
    } else {
      productPrice.textContent = `₦ ${formatter.format(originalPrice)}`;
      discountPrice.style.display = "none";
    }

    // VARIANT DROPDOWN
    priceSelect.innerHTML = `<option value="base">Default</option>`;
    product.variants.forEach(v => {
      if (getTotalStock(v.VariantStockBySize) > 0) {
        priceSelect.innerHTML += `<option value="${v._id}">${v.variantName}</option>`;
      }
    });

    // SIZE SELECT (BASE PRODUCT)
    sizeSelect.innerHTML = `<option value="" disabled selected>Select a size!</option>`;

    let hasBaseStock = false;

    Object.keys(product.stockBySize).forEach(size => {
      const qty = product.stockBySize[size];
      if (qty > 0) {
        hasBaseStock = true;
        sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
      }
    });

    if (!hasBaseStock) {
      sizeSelect.innerHTML = `<option disabled selected>Out of stock :( </option>`;
    }

    // THUMBNAILS
    smallImgGroup.innerHTML = `
      <div class="small-img-col">
        <img class="small-img"
             src="${product.image.url}"
             data-type="base">
      </div>
    `;

    product.variants.forEach(v => {
      if (getTotalStock(v.VariantStockBySize) === 0) return;

      smallImgGroup.innerHTML += `
        <div class="small-img-col">
          <img class="small-img"
               src="${v.Variantimage.url}"
               data-type="variant"
               data-variant-id="${v._id}">
        </div>
      `;
    });

    // THUMBNAIL CLICK HANDLERS
    document.querySelectorAll(".small-img").forEach(img => {
      img.addEventListener("click", () => {
        mainImage.src = img.src;

        if (img.dataset.type === "variant") {
          const variant = product.variants.find(v => v._id === img.dataset.variantId);

          priceSelect.value = variant._id;

          sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;
          Object.keys(variant.VariantStockBySize).forEach(size => {
            if (variant.VariantStockBySize[size] > 0) {
              sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
            }
          });

        } else {
          priceSelect.value = "base";

          sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;

          let hasStock = false;
          Object.keys(product.stockBySize).forEach(size => {
            if (product.stockBySize[size] > 0) {
              hasStock = true;
              sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
            }
          });

          if (!hasStock) {
            sizeSelect.innerHTML = `<option disabled selected>Out of stock</option>`;
          }
        }

        qtyControl.dataset.stock = 0;
        qtyInput.value = 1;
        updateQtyButtons();
      });
    });

    // VARIANT SELECT HANDLER
    priceSelect.addEventListener("change", () => {
      const selected = priceSelect.value;

      sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;

      if (selected === "base") {
        let hasStock = false;

        Object.keys(product.stockBySize).forEach(size => {
          if (product.stockBySize[size] > 0) {
            hasStock = true;
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
          }
        });

        if (!hasStock) {
          sizeSelect.innerHTML = `<option disabled selected>Out of stock</option>`;
        }

      } else {
        const variant = product.variants.find(v => v._id === selected);

        Object.keys(variant.VariantStockBySize).forEach(size => {
          if (variant.VariantStockBySize[size] > 0) {
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
          }
        });
      }

      qtyControl.dataset.stock = 0;
      qtyInput.value = 1;
      updateQtyButtons();
    });

    // SIZE SELECT HANDLER
    sizeSelect.addEventListener("change", () => {
      const selectedSize = sizeSelect.value;
      let maxStock = 0;

      if (priceSelect.value === "base") {
        maxStock = product.stockBySize[selectedSize];
      } else {
        const variant = product.variants.find(v => v._id === priceSelect.value);
        maxStock = variant.VariantStockBySize[selectedSize];
      }

      qtyControl.dataset.stock = maxStock;
      qtyInput.value = 1;

      updateQtyButtons();
    });

    // QUANTITY BUTTONS
    function updateQtyButtons() {
      const maxStock = parseInt(qtyControl.dataset.stock || 1);
      const qty = parseInt(qtyInput.value);

      qtyMinus.disabled = qty <= 1;
      qtyPlus.disabled = qty >= maxStock;
    }

    qtyMinus.addEventListener("click", () => {
      let qty = parseInt(qtyInput.value);
      if (qty > 1) qtyInput.value = qty - 1;
      updateQtyButtons();
    });

    qtyPlus.addEventListener("click", () => {
      let qty = parseInt(qtyInput.value);
      const maxStock = parseInt(qtyControl.dataset.stock || 1);
      if (qty < maxStock) qtyInput.value = qty + 1;
      updateQtyButtons();
    });

    updateQtyButtons();

    // LOAD SIMILAR PRODUCTS
    loadMoreLikeThis(product);

  } catch (err) {
    console.error("Error loading product:", err);
  }
}

loadProduct();

// MORE LIKE THIS SECTION
const moreLikeThisContainer = document.querySelector(".products-wrapper");
const allProductsURL = `${API_URL}/v1/product/`;

// Load similar products
async function loadMoreLikeThis(currentProduct) {
  try {
    const res = await fetch(allProductsURL);
    const allProducts = await res.json();

    const currentKeywords = currentProduct.keywords.map(k => k.toLowerCase());
    const currentNameWords = currentProduct.name.toLowerCase().split(" ");

    const similar = allProducts.filter(p => {
      if (p._id === currentProduct._id) return false;

      const nameWords = p.name.toLowerCase().split(" ");
      const keywords = p.keywords.map(k => k.toLowerCase());

      const keywordMatch = keywords.some(k => currentKeywords.includes(k));
      const nameMatch = nameWords.some(w => currentNameWords.includes(w));

      return keywordMatch || nameMatch;
    });

    renderMoreLikeThis(similar);

  } catch (err) {
    console.error("Error loading similar products:", err);
  }
}

function renderMoreLikeThis(list) {
  moreLikeThisContainer.innerHTML = "";

  if (!list.length) {
    moreLikeThisContainer.innerHTML = "<p>No similar products found.</p>";
    return;
  }

  list.forEach(product => {

    let baseStockTotal = 0;
    if (product.stockBySize) {
      Object.values(product.stockBySize).forEach(qty => {
        baseStockTotal += Number(qty) || 0;
      });
    }

    let variantStockTotal = 0;
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.VariantStockBySize) {
          Object.values(variant.VariantStockBySize).forEach(qty => {
            variantStockTotal += Number(qty) || 0;
          });
        }
      });
    }

    if (baseStockTotal + variantStockTotal === 0) {
      return;
    }

    const imgURL = product.image.url;
    const price = product.price / 100;

    let discountedPrice = null;
    if (product.discount > 0) {
      discountedPrice = (product.price * (100 - product.discount)) / 10000;
    }

    moreLikeThisContainer.innerHTML += `
      <div class="product text-center" data-id="${product._id}">
        <img src="${imgURL}" alt="${product.name}">
        <h5 class="p-name">${product.name}</h5>
        <h4 class="p-price">₦ ${(discountedPrice ?? price).toLocaleString()}</h4>
        ${
          product.discount > 0
            ? `<h5 class="discount-price" style="text-decoration:line-through; color:red;">
                 ₦ ${price.toLocaleString()}
               </h5>`
            : ""
        }
      </div>
    `;
  });
}

// Make similar products clickable
moreLikeThisContainer.addEventListener("click", e => {
  const card = e.target.closest(".product");
  if (!card) return;

  const id = card.dataset.id;
  window.location.href = `product.html?id=${id}`;
});

// ADD TO CART HANDLER
addToCartBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const product = window.currentProduct;

  const selectedVariant = priceSelect.value === "base" ? null : priceSelect.value;
  const selectedSize = sizeSelect.value.trim();
  const quantity = parseInt(qtyInput.value);

  // ALERT ALWAYS WORKS NOW
  if (sizeSelect.selectedIndex === 0) {
    alert("Please select a size or option before adding to cart 😄 ");
    return;
  }

  let unitPrice = product.price;

  let image = {
    url: product.image.url,
    alt: product.image.alt
  };

  if (selectedVariant) {
    const variant = product.variants.find(v => v._id === selectedVariant);

    image = {
      url: variant.Variantimage.url,
      alt: variant.Variantimage.alt
    };
  }

  // DISCOUNT + DISCOUNTED PRICE
  const cartItem = {
    productId,
    name: product.name,
    size: selectedSize,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    image,
    variantId: selectedVariant,
    variantName: selectedVariant
      ? product.variants.find(v => v._id === selectedVariant).variantName
      : null,

    discount: product.discount || 0,
    discountedPrice:
      product.discount > 0
        ? (product.price * (100 - product.discount)) / 100
        : product.price
  };

  if (!user) {
    let guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];

    cartItem._id =
      Date.now().toString() + Math.random().toString(36).substring(2);

    guestCart.push(cartItem);
    localStorage.setItem("guest_cart", JSON.stringify(guestCart));
    
    alert("Added to cart ! 🎉🛒");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/v1/cartItems/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customerId: user.uid,
        ...cartItem
      })
    });

    if (!response.ok) {
      alert("Could not add to cart");
      return;
    }

    alert("Added to cart ! 🛒💖");

  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Something went wrong");
  }
});

const sliders = document.querySelectorAll(".products-wrapper");

sliders.forEach((slider) => {
  let isDragging = false;
  let startX;
  let scrollStart;

  slider.addEventListener("mousedown", (e) => {
    isDragging = true;
    slider.classList.add("dragging");
    startX = e.pageX;
    scrollStart = slider.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    slider.classList.remove("dragging");
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const walk = e.pageX - startX;
    slider.scrollLeft = scrollStart - walk;
  });

  slider.addEventListener("mouseleave", () => {
    isDragging = false;
    slider.classList.remove("dragging");
  });

  slider.addEventListener("click", (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});
