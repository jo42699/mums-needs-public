const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById("closeSidebar");

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed'); // open / close
});

closeSidebar.addEventListener('click', () => {
  sidebar.classList.remove('collapsed'); // CLOSE
});



function previewImage(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);

  if (!file) {
    preview.style.display = "none";
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}







function previewImage(input, previewElementId) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewElementId);
    if (img) img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
