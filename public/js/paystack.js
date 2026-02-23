// paystack.js (ES module safe)

export async function startPayment(userEmail, cartTotalInKobo) {
  try {
    console.log("EMAIL:", userEmail);
    console.log("AMOUNT:", cartTotalInKobo);

    if (!userEmail || !cartTotalInKobo) {
      console.error("Missing payment data");
      alert("Missing payment data");
      return;
    }

    // 1. INIT PAYMENT WITH BACKEND
    const initRes = await fetch("http://localhost:5000/v1/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        amount: cartTotalInKobo
      })
    });

    if (!initRes.ok) {
      console.error("Init failed:", await initRes.text());
      alert("Payment initialization failed");
      return;
    }

    const initData = await initRes.json();
    console.log("INIT DATA:", initData);

    // ⭐ MAKE CALLBACK GLOBAL (Paystack requires this)
    window.paystackPaymentCallback = async function (response) {
      console.log("PAYSTACK CALLBACK:", response);

      const verifyRes = await fetch("http://localhost:5000/v1/paystack/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: response.reference })
      });

      const verifyData = await verifyRes.json();
      console.log("Verification:", verifyData);

      if (verifyData.success) {
        alert("Payment successful!");
      } else {
        alert("Payment failed");
      }
    };

    // ⭐ MAKE onClose GLOBAL TOO
    window.paystackCloseHandler = function () {
      alert("Payment window closed");
    };

    // 2. OPEN PAYSTACK POPUP
    var handler = PaystackPop.setup({
      key: "pk_test_f850fa31d213443914e7f3d9fd64cf33041379ce",
      email: initData.email,
      amount: initData.amount,
      ref: initData.reference,

      callback: window.paystackPaymentCallback,
      onClose: window.paystackCloseHandler
    });

    handler.openIframe();

  } catch (error) {
    console.error("Payment error:", error);
  }
}
