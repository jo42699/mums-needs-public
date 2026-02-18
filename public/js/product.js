import { auth } from "./auth.js";

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

// Disable Add to Cart initially until size is selected
//addToCartBtn.disabled = true;

// LOAD PRODUCT DETAILS
async function loadProduct() {
  try {
    const res = await fetch(`http://localhost:5000/v1/product/${productId}`);
    const product = await res.json();

    window.currentProduct = product;

    // MAIN IMAGE
    mainImage.src = `http://localhost:5000${product.image.url}`;
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
        <span style="font-size: 18px; text-decoration: line-through; color: #888; display:block;">
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
      priceSelect.innerHTML += `<option value="${v._id}">${v.variantName}</option>`;
    });

    // SIZE SELECT (BASE PRODUCT)
    sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;
    Object.keys(product.stockBySize).forEach(size => {
      sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
    });

    // THUMBNAILS
    smallImgGroup.innerHTML = `
      <div class="small-img-col">
        <img class="small-img"
             src="http://localhost:5000${product.image.url}"
             data-type="base">
      </div>
    `;

    product.variants.forEach(v => {
      smallImgGroup.innerHTML += `
        <div class="small-img-col">
          <img class="small-img"
               src="http://localhost:5000${v.Variantimage.url}"
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
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
          });

        } else {
          priceSelect.value = "base";

          sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;
          Object.keys(product.stockBySize).forEach(size => {
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
          });
        }

        qtyControl.dataset.stock = 0;
        qtyInput.value = 1;
        addToCartBtn.disabled = true;
        updateQtyButtons();
      });
    });

    // VARIANT SELECT HANDLER
    priceSelect.addEventListener("change", () => {
      const selected = priceSelect.value;

      sizeSelect.innerHTML = `<option disabled selected>Select a size!</option>`;
      addToCartBtn.disabled = true;

      if (selected === "base") {
        Object.keys(product.stockBySize).forEach(size => {
          sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
        });
      } else {
        const variant = product.variants.find(v => v._id === selected);

        Object.keys(variant.VariantStockBySize).forEach(size => {
          sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
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
      addToCartBtn.disabled = false;
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
const allProductsURL = "http://localhost:5000/v1/product/";

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

// Increment cart count in UI

/*function incrementCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;

  let current = parseInt(countEl.textContent) || 0;
  countEl.textContent = current + 1;
}


*/






// Render similar products
function renderMoreLikeThis(list) {
  moreLikeThisContainer.innerHTML = "";

  if (!list.length) {
    moreLikeThisContainer.innerHTML = "<p>No similar products found.</p>";
    return;
  }

  list.forEach(product => {
    const imgURL = `http://localhost:5000${product.image.url}`;
    const price = product.price / 100;
    const discount = product.discount / 100;

    moreLikeThisContainer.innerHTML += `
      <div class="product text-center" data-id="${product._id}">
        <img src="${imgURL}" alt="${product.name}">
        <h5 class="p-name">${product.name}</h5>
        <h4 class="p-price">₦ ${price.toLocaleString()}</h4>
        <h5 class="discount-price">₦ ${discount.toLocaleString()}</h5>
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

  const selectedVariant = priceSelect.value;
  const selectedSize = sizeSelect.value;
  const quantity = parseInt(qtyInput.value);

  if (!selectedSize) {
    alert("Please select a size");
    return;
  }

  // BASE PRICE (variants do NOT have their own price)
  let unitPrice = product.price;

  // IMAGE
  let image = {
    url: product.image.url,
    alt: product.image.alt
  };

  // VARIANT SELECTED
  if (selectedVariant !== "base") {
    const variant = product.variants.find(v => v._id === selectedVariant);

    image = {
      url: variant.Variantimage.url,
      alt: variant.Variantimage.alt
    };
  }

  const cartItem = {
    productId,
    name: product.name,
    size: selectedSize,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    image
  };

  // GUEST CART
  if (!user) {
    let guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];

    cartItem._id =
      Date.now().toString() + Math.random().toString(36).substring(2);

    guestCart.push(cartItem);
    localStorage.setItem("guest_cart", JSON.stringify(guestCart));
    
    alert("Added to cart!");
    return;
  }

  // USER CART
  try {
    const response = await fetch("http://localhost:5000/v1/cart/add", {
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
   
    alert("Added to cart!");

  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Something went wrong");
  }
});
