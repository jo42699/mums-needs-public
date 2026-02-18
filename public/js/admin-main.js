
// IMAGE PREVIEW FUNCTION

document.addEventListener("change", function (e) {
    if (e.target.type === "file" && e.target.accept.includes("image")) {
        const file = e.target.files[0];
        if (!file) return;

        // Find the <img> immediately after the input
        const previewImg = e.target.nextElementSibling;

        if (previewImg && previewImg.tagName === "IMG") {
            previewImg.src = URL.createObjectURL(file);
            previewImg.style.display = "block";
        }
    }
});
