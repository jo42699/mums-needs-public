import { API } from "./config/config.js";

// IMAGE PREVIEW  

window.previewImage = function (inputOrEvent, previewId) {
  const inputElement = inputOrEvent.target ? inputOrEvent.target : inputOrEvent;
  const file = inputElement.files[0];
  if (!file) return;

  const preview = document.getElementById(previewId);
  if (!preview) return;

  preview.src = URL.createObjectURL(file);
  preview.onload = () => URL.revokeObjectURL(preview.src);
};

// MAIN SCRIPT 

document.addEventListener("DOMContentLoaded", () => {

  //REMOVE ROW  
  window.removeRow = function (btn) {
    btn.parentElement.remove();
  };

  // ADD SIZE ROWS 
  function addRow(containerId) {
    const container = document.getElementById(containerId);
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `
      <input type="text" name="sizes[]" placeholder="Size" required>
      <input type="number" name="stock[]" placeholder="Stock" min="0" required>
      <button class="button-css" type="button" onclick="removeRow(this)">✕</button>
    `;
    container.appendChild(row);
  }

  window.addRowOne = () => addRow("sizes-container-1");
  window.addRowTwo = () => addRow("sizes-container-2");
  window.addRowThree = () => addRow("sizes-container-3");

  // IMAGE PREVIEWS 

  const mainImageInput = document.querySelector("input[name='image']");
  if (mainImageInput) {
    mainImageInput.addEventListener("change", () => {
      previewImage(mainImageInput, "preview1");
    });
  }

  const variantInputs = document.querySelectorAll("input[name='variantImages']");
  variantInputs.forEach((input, index) => {
    const previewId = "preview_variant_" + index;

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

  //FORM SUBMIT /

  const form = document.getElementById("productForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {

      // Build stockBySize object for main product
      const stockBySize = {};
      document.querySelectorAll("#sizes-container-1 .size-row")
        .forEach(row => {
          const size = row.querySelector("input[name='sizes[]']").value.trim();
          const stock = parseInt(row.querySelector("input[name='stock[]']").value);
          if (size) stockBySize[size] = stock;
        });

      /*  VARIANTS  */
      const variants = [];
      const variantNameInputs = document.querySelectorAll("input[name='variant_name']");

      function processVariant(index, containerId) {
        if (!variantNameInputs[index]) return;

        const name = variantNameInputs[index].value.trim();
        if (!name) return;

        const VariantStockBySize = {};
        document.querySelectorAll(`#${containerId} .size-row`)
          .forEach(row => {
            const size = row.querySelector("input[name='sizes[]']").value.trim();
            const stock = parseInt(row.querySelector("input[name='stock[]']").value);
            if (size) VariantStockBySize[size] = stock;
          });

        variants.push({ variantName: name, VariantStockBySize });
      }

      processVariant(0, "sizes-container-2");
      processVariant(1, "sizes-container-3");

      //BUILD PRODUCT DATA 
      const data = {
        name: document.querySelector("input[name='product_name']").value.trim(),
        description: document.querySelector("textarea[name='description']").value.trim(),
        price: parseInt(document.querySelector("input[name='price']").value),
        discount: parseInt(document.querySelector("input[name='discount']").value) || 0,
        section: document.querySelector("select[name='section']").value,
        keywords: document.querySelector("input[name='keywords']").value
          .split(",")
          .map(k => k.trim())
          .filter(Boolean),
        stockBySize,
        variants
      };

      document.getElementById("dataField").value = JSON.stringify(data);

      // SUBMIT TO API 
      const formData = new FormData(form);

      const response = await fetch(`${API}/product`, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      alert("Product uploaded successfully !");
      form.reset();

    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    }
  });

});