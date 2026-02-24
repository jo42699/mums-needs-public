

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
  const verifyRes = await fetch("http://localhost:5000/v1/paystack/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference })
  });

  const verifyData = await verifyRes.json();
  console.log("Verification:", verifyData);

  if (verifyData.success) {
    alert("Payment successful!");
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
    const initRes = await fetch("http://localhost:5000/v1/paystack/init", {
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
