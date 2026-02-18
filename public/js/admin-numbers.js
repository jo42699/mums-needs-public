// THIS IS MY UTILS FILE FOR ADMIN NUMBERS PAGE



// TO GET THE TOTAL NUMBER OF USERS
fetch("http://localhost:5000/auth/total-users", { 
    method: "GET", credentials: "include" 
}).then(res => res.json())
  .then(data => { 
    document.getElementById("count").textContent = data.totalUsers;
   }) 
  .catch(err => { 
   console.error(err); document.getElementById("count").textContent = "Error loading total users";
   });