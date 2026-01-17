const searchIcon = document.getElementById("searchIcon");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");

// FIXED: renamed to avoid conflict
const mobileSearchBox = document.getElementById("mobileSearch");
const closeMobileSearch = document.getElementById("closeMobileSearch");

const sliders = document.querySelectorAll(".products-wrapper");

searchIcon.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    mobileSearchBox.classList.add("active");
  } else {
    searchBox.classList.add("active");
  }
});

closeSearch.addEventListener("click", () => {
  searchBox.classList.remove("active");
});

closeMobileSearch.addEventListener("click", () => {
  mobileSearchBox.classList.remove("active");
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




// to make images change on click
    const productDisplay = document.querySelector('.product-display img');
    const smallImages = document.querySelectorAll('.small-img');

    smallImages.forEach((img) => {
      img.addEventListener('click', () => {
        productDisplay.src = img.src;
      });
    });























    //shop














