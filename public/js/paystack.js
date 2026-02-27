import { API } from "./config/config.js";


function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Paystack script");
    document.body.appendChild(script);
  });
}

// Separate async function (callback itself must NOT be async)
async function verifyPayment(reference) {
  // Load checkout data FIRST
  const checkoutData = JSON.parse(localStorage.getItem("checkoutDetails"));
  const customerId = localStorage.getItem("customerId");

  if (!checkoutData) {
    console.error("checkoutDetails is missing from localStorage");
    alert("Checkout data missing. Please complete checkout again.");
    return;
  }

  //  Now it's safe to use it
  const cartItems = checkoutData.items;

  const verifyRes = await fetch(`${API}/paystack/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference,
      items: cartItems,
      customerDetails: checkoutData.customerDetails,
      customerId,
      cartTotal: checkoutData.cartTotal   //ONLY TOTAL NEEDED
    })
  });

  const verifyData = await verifyRes.json();
  console.log("Verification:", verifyData);

  if (verifyData.success) {
    //  Clear cart
    localStorage.removeItem("cart");

    //  Redirect to success page
    window.location.href = `/success.html?order=${verifyData.orderId}`;
  } else {
    alert("Payment failed");
  }
}

export async function startPayment(userEmail, cartTotalInKobo) {
  try {
    if (!userEmail || !cartTotalInKobo) {
      alert("Missing payment data");
      return;
    }

    // Ensure Paystack script is loaded
    await loadPaystack();

    // INIT PAYMENT WITH BACKEND
    const initRes = await fetch(`${API}/paystack/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, amount: cartTotalInKobo })
    });

    const initData = await initRes.json();
    console.log("INIT DATA:", initData);

    // CALLBACK MUST NOT BE ASYNC
    window.paystackPaymentCallback = function (response) {
      console.log("PAYSTACK CALLBACK:", response);
      verifyPayment(response.reference);
    };

    window.paystackCloseHandler = function () {
      alert("Payment window closed");
    };

    const handler = window.PaystackPop.setup({
      key: "pk_test_f850fa31d213443914e7f3d9fd64cf33041379ce",
      email: initData.email,
      amount: initData.amount,
      callback: window.paystackPaymentCallback,
      onClose: window.paystackCloseHandler
    });

    handler.openIframe();

  } catch (error) {
    console.error("Payment error:", error);
  }
}





/** 
 * 
 *  For this section i had issues with the Paystack callback not being triggered, which is why i moved the callback and verification logic to the global scope. I also had an isssue with the async callback which i tried to use but paystack does not support async callbacks, which is why the callback itself is not async but calls an async function to do the verification. I also made sure to load the checkout data before starting the payment process, so that it's available when the callback is triggered.
 * 
 * 
 * 
 * 
 */