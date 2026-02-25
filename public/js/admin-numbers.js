// THIS IS MY UTILS FILE FOR ADMIN NUMBERS PAGE

// Fetch total users and display
fetch("http://localhost:5000/v1/auth/total-users", {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("count").textContent = data.totalUsers;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("count").textContent = "Error loading total users";
  });



// Fetch total orders and display
fetch("http://localhost:5000/v1/orders", {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("total-orders").textContent = data.count;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("total-orders").textContent = "Error loading total orders";
  });



// Fetch total revenue and display
fetch("http://localhost:5000/v1/orders", {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json()) 
  .then(data => {
    const totalRevenue = data.orders.reduce((sum, order) => sum + order.cartTotal, 0);
    document.getElementById("total-revenue").textContent = `₦${(totalRevenue/100).toLocaleString()}`;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("total-revenue").textContent = "Error loading total revenue";
  });