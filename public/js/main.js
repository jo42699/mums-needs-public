import { getCartCount } from "./cart.js";

const searchIcon = document.getElementById("searchIcon");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");
const mobileSearchBox = document.getElementById("mobileSearch");
const closeMobileSearch = document.getElementById("closeMobileSearch");

const sliders = document.querySelectorAll(".products-wrapper");

searchIcon.addEventListener("click", () => {

  const navbarCollapse = document.getElementById("navbarSupportedContent");
  const isMobile = window.innerWidth <= 768;

  if (navbarCollapse.classList.contains("show")) {

    navbarCollapse.addEventListener("hidden.bs.collapse", function handler() {
      navbarCollapse.removeEventListener("hidden.bs.collapse", handler);

      // Open search AFTER nav fully closes
      if (isMobile) {
        mobileSearchBox.classList.add("active");
      } else {
        searchBox.classList.add("active");
      }
    });

    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
    bsCollapse.hide();

  } else {
    // If navbar already closed
    if (isMobile) {
      mobileSearchBox.classList.add("active");
    } else {
      searchBox.classList.add("active");
    }
  }

});

closeSearch.addEventListener("click", () => {
  searchBox.classList.remove("active");
});

closeMobileSearch.addEventListener("click", () => {
  mobileSearchBox.classList.remove("active");
});





// Update cart count on page load
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("added-to-cart");
  if (el) el.textContent = getCartCount();
});




// Drag to scroll functionality
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



// not realy needed rn because its handled in my product.js file
// to make images change on click
    const productDisplay = document.querySelector('.product-display img');
    const smallImages = document.querySelectorAll('.small-img');

    smallImages.forEach((img) => {
      img.addEventListener('click', () => {
        productDisplay.src = img.src;
      });
    });












