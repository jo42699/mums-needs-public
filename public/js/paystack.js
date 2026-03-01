import { API } from "./config/config.js";



function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true; // small improvement
    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Paystack script");
    document.body.appendChild(script);
  });
}

// Verify payment with backend

async function verifyPayment(reference) {
  try {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutDetails"));
    const customerId = localStorage.getItem("customerId");

    if (!checkoutData || !checkoutData.items) {
      console.error("checkoutDetails missing during verification");
      alert("Checkout data missing. Please contact support.");
      return;
    }

    const verifyRes = await fetch(`${API}/paystack/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference, 
        items: checkoutData.items,
        customerDetails: checkoutData.customerDetails,
        customerId
      })
    });

    if (!verifyRes.ok) {
      throw new Error("Verification request failed");
    }

    const verifyData = await verifyRes.json();
    console.log("Verification:", verifyData);

    if (verifyData.success) {
      // Clear cart  after backend confirms success
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutDetails");

      window.location.href = `/success.html?order=${verifyData.orderId}`;
    } else {
      alert(verifyData.message || "Payment verification failed");
    }

  } catch (error) {
    console.error("Verification error:", error);
    alert("An error occurred while verifying payment.");
  }
}

/**
 * Starts Paystack payment flow.
 */
export async function startPayment(userEmail) {
  try {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutDetails"));

    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      alert("Checkout data missing");
      return;
    }

    await loadPaystack();

// Initialize payment on backend to get reference and amount
    const initRes = await fetch(`${API}/paystack/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        items: checkoutData.items
      })
    });

    if (!initRes.ok) {
      throw new Error("Payment initialization failed");
    }

    const initData = await initRes.json();
    console.log("INIT DATA:", initData);

    if (!initData.success || !initData.reference || !initData.cartTotal) {
      alert("Payment initialization failed");
      return;
    }

    /**
     * IMPORTANT:
     * Callback must NOT be async.
     * Paystack will return the SAME reference
     * because useCustomReference: true
     */
    window.paystackPaymentCallback = function (response) {
      console.log("PAYSTACK CALLBACK:", response);

      if (response.status === "success") {
        verifyPayment(response.reference);
      } else {
        alert("Payment was not successful");
      }
    };

    window.paystackCloseHandler = function () {
      console.warn("Payment popup closed by user");
    };

    /**
     * Paystack setup
     * Amount MUST be in kobo.
     */
    const handler = window.PaystackPop.setup({
      key: "pk_test_f850fa31d213443914e7f3d9fd64cf33041379ce",
      email: initData.email,
      amount: initData.finalAmount, // already in kobo
      reference: initData.reference, // your secure backend reference
      useCustomReference: true,
      callback: window.paystackPaymentCallback,
      onClose: window.paystackCloseHandler
    });

    handler.openIframe();

  } catch (error) {
    console.error("Payment error:", error);
    alert("Unable to start payment. Please try again.");
  }
}
/**
 * 
 * *  For this section i had issues with the Paystack callback not being triggered, which is why i moved the callback and verification logic to the global scope. I also had an isssue with the async callback which i tried to use but paystack does not support async callbacks, which is why the callback itself is not async but calls an async function to do the verification. I also made sure to load the checkout data before starting the payment process, so that it's available when the callback is triggered.
 * 
 * *  I also removed the amount from the frontend and made sure the backend calculates the total securely based on the items sent, to prevent any tampering with the amount on the client side. The backend will calculate the total based on the product prices and quantities, and will not rely on any amount sent from the frontend.
 * 
 */
