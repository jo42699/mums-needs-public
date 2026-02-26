
// IMAGE PREVIEW FUNCTION

document.addEventListener("change", function (e) {
    if (e.target.type === "file" && e.target.accept.includes("image")) {
        const file = e.target.files[0];
        if (!file) return;

        const container = e.target.closest(".image-group");
        const previewImg = container.querySelector(".image-preview");

        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = "block";
    }
});