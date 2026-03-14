

# 🛍️ E-Commerce Website

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Made%20With-Love-red?style=for-the-badge" />
  
</p>

<p align="center">
  A modern and responsive E-Commerce Web Application designed to provide a smooth online shopping experience with a clean UI, secure checkout, and powerful product management.
</p>

---

## ✨ Features

- 🛒 **Product Catalog**  
  Browse a wide variety of products with detailed descriptions and pricing.

- 🔍 **Search & Filter**  
  Quickly find products using smart search and category filters.

- 👤 **User Authentication**  
  Secure sign up, login, and user profile management with Firebase.

- 🛍 **Shopping Cart**  
  Add, remove, and manage items before checkout.

- 💳 **Secure Checkout**  
  Simple and secure checkout process with Paystack.

- 📦 **Order Management**  
  Track orders and view purchase history in the Admin End.

- 📱 **Responsive Design**  
  Fully optimized for mobile, tablet, and desktop devices.


---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Tools |
|----------|---------|----------|-------|
| HTML     | Node.js | MongoDB  | Git   |
| CSS      | Express.js | Cloudinary | GitHub |
| JavaScript| REST API | Firebase | VS Code |
| 

---

## 📂 Project Structure


MumsNeeds

frontend  
&nbsp;&nbsp;components  
&nbsp;&nbsp;pages  
&nbsp;&nbsp;styles  

backend  
&nbsp;&nbsp;routes  
&nbsp;&nbsp;controllers  
&nbsp;&nbsp;models  

database  

README.md

## 💡 Thoughts & Problems Overcome

During the development of this e-commerce project, I faced and overcame several challenges and found a way to resolve them:

- **Integrating secure user authentication** – I did this with Firebase which was repletely easy the problem came for the login in the admin end i tried using firebase admin but i made a mistake where if a user logs in the could also login in the admin end so i thought of Hardcoding the email and password and processing from env but that didn't seem like a good idea, i finally found out a way to sign a user as admin by using their FirebaseUID and initially i had it in a config file but later processed from env .

- **Handling dynamic cart functionality** – Implemented add/remove/update operations with real-time updates.

- **Image handling** – I was loading images from the admin end into the image folder and that doesn't work in prod so i incorporated cloudinary a cloud based storage.

- **Error handling in checkout and payment flow** – In the paystack popup i had some issues with the popup because i was using an async callback on it, i later found out async was developed after the creation of Paystack and didnt use it.

- **Optimizing performance** – Reduced load times by implementing lazy loading for images and efficient database queries.


- **CORS** – Jeez this gave me a lot of headache but it was worth it because i learned alot.




