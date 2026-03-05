
import { API } from "./config/config.js";


// THIS IS MY UTILS FILE FOR ADMIN NUMBERS PAGE

// Fetch total users and display
fetch(`${API}/auth/total-users`, {
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


/*
fetch(`${API}/orders`, {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {

    //  Date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Filter orders created within the last month
    const recentOrders = data.orders.filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= oneMonthAgo;
    });

    //  Display count of recent orders
    document.getElementById("total-orders").textContent = recentOrders.length;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("total-orders").textContent = "Error loading total orders";
  });
*/

/*

fetch(`${API}/orders`, {
  method: "GET",
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {

    // 1. Get date 30 days ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 2. Filter orders created within the last month
    const recentOrders = data.orders.filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= oneMonthAgo;
    });

    // 3. Calculate revenue from recent orders only
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.cartTotal, 0);

    document.getElementById("total-revenue").textContent =
      `₦${(totalRevenue / 100).toLocaleString()}`;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("total-revenue").textContent = "Error loading total revenue";
  });

*/



async function loadMonthlyRevenue() {
  try {
    const res = await fetch(`${API}/orders`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

  
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 

  
    const monthlyOrders = data.orders.filter(order => {
      const createdAt = new Date(order.createdAt);
      return (
        createdAt.getFullYear() === currentYear &&
        createdAt.getMonth() === currentMonth
      );
    });

    // 3. Sum revenue for this month
    const totalRevenue = monthlyOrders.reduce(
      (sum, order) => sum + order.cartTotal,
      0
    );

    document.getElementById("total-revenue").textContent =
      `₦${(totalRevenue / 100).toLocaleString()}`;

  } catch (err) {
    console.error(err);
    document.getElementById("total-revenue").textContent =
      "Error loading total revenue";
  }
}

loadMonthlyRevenue();


 

async function loadMonthlyOrders() {
try{
  const res = await fetch(`${API}/orders`, {
  method: "GET",
  credentials: "include"
})

   const data = await res.json();

    const now = new  Date()
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 

    const monthlyRevenue = data.orders.filter(order => {
      const createdAt = new Date(order.createdAt);
      return (
        createdAt.getFullYear() === currentYear &&
        createdAt.getMonth() === currentMonth
      );
    });

    document.getElementById("total-orders").textContent = monthlyRevenue.length;



}catch(err){
console.error(err);
document.getElementById("total-orders").textContent = "Error loading total orders";

}}; 

loadMonthlyOrders();

