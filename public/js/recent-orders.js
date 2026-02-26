document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/v1/orders";
  const tableBody = document.querySelector("tbody");
  const drawer = document.getElementById("orderDrawer");
  const drawerContent = document.querySelector(".drawer-content");
  const closeDrawerBtn = document.getElementById("closeDrawer");
  const searchInput = document.querySelector(".search-container input");
  const rowsPerPage = 5;
  let orders = [], filteredOrders = [], currentOrderId = null, currentPage = 1;

  function saveDeliveredStatus(orderId) {
    const deliveredOrders = JSON.parse(localStorage.getItem("deliveredOrders") || "[]");
    if (!deliveredOrders.includes(orderId)) deliveredOrders.push(orderId);
    localStorage.setItem("deliveredOrders", JSON.stringify(deliveredOrders));
  }

  function isDelivered(orderId) {
    const deliveredOrders = JSON.parse(localStorage.getItem("deliveredOrders") || "[]");
    return deliveredOrders.includes(orderId);
  }


  // Fetch orders from backend
  async function fetchOrders() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) orders = data;
      else if (Array.isArray(data.orders)) orders = data.orders;
      else if (Array.isArray(data.data)) orders = data.data;
      else orders = [];
      filteredOrders = [...orders];
      renderOrders();
      updatePagination();
    } catch (err) { console.error(err); }
  }


  // Render orders in table
  function renderOrders() {
    tableBody.innerHTML = "";
    filteredOrders.forEach(order => {
      const itemsArray = order.items || order.cartItems || [];
      const totalQty = itemsArray.reduce((a,b)=>a+(b.quantity||0),0);
      const paymentStatus = order.payment?.paymentStatus?"Paid":"Unpaid";
      const paymentClass = order.payment?.paymentStatus?"paid":"pending";
      const statusValue = isDelivered(order._id)? "delivered": order.orderStatus || "pending";
      const statusClass = statusValue==="delivered"?"delivered":"pending";
      const totalAmount = ((order.cartTotal||0)/100).toLocaleString();
      const row = document.createElement("tr");
      row.classList.add("order-row");
      row.dataset.id = order._id;
      row.innerHTML = `
        <td>
          <div class="customer">
            <div class="avatar"><i class="fa-solid fa-user"></i></div>
            <span>${order.customerDetails?.name||"N/A"}</span>
          </div>
        </td>
        <td>#${order._id.slice(-6)}</td>
        <td><span class="badge ${paymentClass}">${paymentStatus}</span></td>
        <td>${totalQty}</td>
        <td><span class="badge ${statusClass}">${statusValue}</span></td>
        <td>₦${totalAmount}</td>
        <td><button class="action-btn open-btn" data-id="${order._id}">View</button></td>
      `;
      tableBody.appendChild(row);
    });
    attachRowEvents();
    applyPagination();
  }

  function attachRowEvents() {
    document.querySelectorAll(".open-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const orderId = btn.dataset.id;
        const order = orders.find(o=>o._id===orderId);
        openDrawer(order);
      });
    });
  }




  // Open drawer with order details
  function openDrawer(order) {
    currentOrderId = order._id;
    const itemsArray = order.items || order.cartItems || [];
    const itemsHTML = itemsArray.map(item => `
      <div class="drawer-item">
        <img src="http://localhost:5000${item.image?.url||''}" width="50"/>
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-meta">Qty: ${item.quantity} · ₦${((item.totalPrice||0)/100).toLocaleString()}</div>
        </div>
      </div>
    `).join("");
    const statusValue = isDelivered(order._id)? "delivered": order.orderStatus || "pending";
    drawerContent.innerHTML = `
      <p><strong>Customer:</strong> ${order.customerDetails?.name||"N/A"}</p>
      <br>
      <p><strong>Email:</strong> ${order.customerDetails?.email||"N/A"}</p>
      <br>
      <p><strong>Phone:</strong> ${order.customerDetails?.phone||"N/A"}</p>
      <br>
      <p><strong>Address:</strong> ${order.customerDetails?.address||"N/A"}</p>
      <br>
      <p><strong>Status:</strong> ${statusValue}</p>
      <br>
      <hr>
      <h4>Items</h4>
      <div class="drawer-items">${itemsHTML}</div>
      <hr>
      <br>
      <p><strong>Total:</strong> ₦${((order.cartTotal||0)/100).toLocaleString()}</p>
      <div class="drawer-actions">
        <button class="primary-btn" id="markDeliveredBtn">Mark as delivered</button>
        <button class="secondary-btn" id="deleteOrderBtn">Delete &nbsp;<i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    drawer.classList.add("open");
    document.getElementById("markDeliveredBtn").addEventListener("click", markAsDelivered);
    document.getElementById("deleteOrderBtn").addEventListener("click", deleteOrder);
  }


  // Mark order as delivered (locally)
  function markAsDelivered() {
    if(!currentOrderId) return;
    saveDeliveredStatus(currentOrderId);
    renderOrders();
    drawer.classList.remove("open");
  }


// Delete order (from backend)
  async function deleteOrder() {
    if(!currentOrderId || !confirm("Delete this order?")) return;
    try {
      await fetch(`${API_URL}/${currentOrderId}`,{method:"DELETE"});
      orders = orders.filter(o=>o._id!==currentOrderId);
      filteredOrders = filteredOrders.filter(o=>o._id!==currentOrderId);
      const deliveredOrders = JSON.parse(localStorage.getItem("deliveredOrders")||"[]");
      localStorage.setItem("deliveredOrders", JSON.stringify(deliveredOrders.filter(id=>id!==currentOrderId)));
      renderOrders();
      drawer.classList.remove("open");
    } catch(err){ console.error(err); }
  }

  closeDrawerBtn?.addEventListener("click", ()=>drawer.classList.remove("open"));

  const paginationContainer = document.getElementById("pagination") || (() => {
    const div = document.createElement("div"); div.id="pagination"; div.classList.add("pagination");
    tableBody.parentNode.appendChild(div); return div;
  })();

  function applyPagination() {
    const rows = Array.from(tableBody.querySelectorAll("tr.order-row"));
    rows.forEach((row,i)=>row.style.display = (i>=(currentPage-1)*rowsPerPage && i<currentPage*rowsPerPage) ? "table-row" : "none");
    renderPaginationButtons(rows);
  }





  fetchOrders();
});


