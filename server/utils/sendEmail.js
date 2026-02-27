const axios = require("axios");

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Mums Needs",
          email: process.env.EMAIL_FROM, // your no-reply or verified email
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY, // NOT SMTP password
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Email sending failed:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;