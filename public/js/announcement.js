import { API } from "./config/config.js";



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("updateSectionsForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      sections: [
        {
          title: document.getElementById("section1Title").value.trim(),
          description: document.getElementById("section1Description").value.trim()
        },
        {
          title: document.getElementById("section2Title").value.trim(),
          description: document.getElementById("section2Description").value.trim()
        },
        {
          title: document.getElementById("section3Title").value.trim(),
          description: document.getElementById("section3Description").value.trim()
        }
      ]
    };

    try {
      const res = await fetch(`${API}/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log(data);

      alert("Sections updated successfully");

    } catch (err) {
      console.error(err);
      alert("Failed to update sections");
    }
  });
});
