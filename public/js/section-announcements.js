import { API_URL } from "./config/config.js";


fetch(`${API_URL}/v1/announcement`)
  .then(res => res.json())
  .then(data => {
    const sections = data.sections;

    document.getElementById("section1Title").textContent = sections[0].title;
    document.getElementById("section1Desc").textContent = sections[0].description;

    document.getElementById("section2Title").textContent = sections[1].title;
    document.getElementById("section2Desc").textContent = sections[1].description;

    document.getElementById("section3Title").textContent = sections[2].title;
    document.getElementById("section3Desc").textContent = sections[2].description;
  });
