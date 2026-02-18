document.addEventListener("DOMContentLoaded", () => {

 
  // REMOVE ROW

  window.removeRow = function (btn) {
    btn.parentElement.remove();
  };


  //  SIZE ROW FOR MAIN PRODUCT

  window.addRowOne = function () {
    const container = document.getElementById("sizes-container-1");
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `
      <input type="text" name="sizes[]" placeholder="Size" required>
      <input type="number" name="stock[]" placeholder="Stock" min="0" required>
      <button class="button-css" type="button" onclick="removeRow(this)">✕</button>
    `;
    container.appendChild(row);
  };

  
  // ADD SIZE ROW FOR VARIANT 1
 
  window.addRowTwo = function () {
    const container = document.getElementById("sizes-container-2");
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `
      <input type="text" name="sizes[]" placeholder="Size" required>
      <input type="number" name="stock[]" placeholder="Stock" min="0" required>
      <button class="button-css" type="button" onclick="removeRow(this)">✕</button>
    `;
    container.appendChild(row);
  };

 
  // ADD SIZE ROW FOR VARIANT 2
  
  window.addRowThree = function () {
    const container = document.getElementById("sizes-container-3");
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `
      <input type="text" name="sizes[]" placeholder="Size" required>
      <input type="number" name="stock[]" placeholder="Stock" min="0" required>
      <button class="button-css" type="button" onclick="removeRow(this)">✕</button>
    `;
    container.appendChild(row);
  };

  
  // FORM SUBMIT HANDLER

  document.getElementById("productForm").addEventListener("submit", function () {

   
    // MAIN PRODUCT STOCK BY SIZE
   
    const stockBySize = {};
    const mainRows = document.querySelectorAll("#sizes-container-1 .size-row");

    mainRows.forEach(row => {
      const size = row.querySelector("input[name='sizes[]']").value.trim();
      const stock = parseInt(row.querySelector("input[name='stock[]']").value);
      stockBySize[size] = stock;
    });

    
    // VARIANTS (OPTIONAL)
    
    const variants = [];

    // Collect all variant name inputs
    const variantNameInputs = document.querySelectorAll("input[name='variant_name']");

    // Variant 1
    if (variantNameInputs[0] && variantNameInputs[0].value.trim() !== "") {
      const VariantStockBySize = {};
      const rows = document.querySelectorAll("#sizes-container-2 .size-row");

      rows.forEach(row => {
        const size = row.querySelector("input[name='sizes[]']").value.trim();
        const stock = parseInt(row.querySelector("input[name='stock[]']").value);
        VariantStockBySize[size] = stock;
      });

      variants.push({
        variantName: variantNameInputs[0].value.trim(),
        VariantStockBySize
      });
    }

    // Variant 2
    if (variantNameInputs[1] && variantNameInputs[1].value.trim() !== "") {
      const VariantStockBySize = {};
      const rows = document.querySelectorAll("#sizes-container-3 .size-row");

      rows.forEach(row => {
        const size = row.querySelector("input[name='sizes[]']").value.trim();
        const stock = parseInt(row.querySelector("input[name='stock[]']").value);
        VariantStockBySize[size] = stock;
      });

      variants.push({
        variantName: variantNameInputs[1].value.trim(),
        VariantStockBySize
      });
    }

   
    //JSON OBJECT FOR ALL PRODUCT DATA
    
    const data = {
      name: document.querySelector("input[name='product_name']").value.trim(),
      description: document.querySelector("textarea[name='description']").value.trim(),
      price: parseInt(document.querySelector("input[name='price']").value),
      discount: parseInt(document.querySelector("input[name='discount']").value) || 0,
      section: document.querySelector("select[name='section']").value,
      keywords: document.querySelector("input[name='keywords']").value
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0),
      stockBySize,
      variants 
    };

   
    // INJECT JSON INTO HIDDEN FIELD FOR SUBMISSION
    
    document.getElementById("dataField").value = JSON.stringify(data);
  });

});


document.addEventListener("DOMContentLoaded", () => {
  // Main product image
  const mainImageInput = document.querySelector("input[name='image']");
  if (mainImageInput) {
    mainImageInput.addEventListener("change", () => {
      previewImage(mainImageInput, "preview1");
    });
  }

  // Variant images
  const variantInputs = document.querySelectorAll("input[name='variantImages']");
  variantInputs.forEach((input, index) => {
    const previewId = "preview_variant_" + index;

    // Create preview <img> if image is not present
    let img = input.nextElementSibling;
    if (!img || img.tagName.toLowerCase() !== "img") {
      img = document.createElement("img");
      img.id = previewId;
      img.className = "image-preview";
      input.insertAdjacentElement("afterend", img);
    } else {
      img.id = previewId;
    }

    input.addEventListener("change", () => {
      previewImage(input, previewId);
    });
  });
});
