require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const admin = require("firebase-admin");
const serviceAccount = require("./mums-needs-b074d-firebase-adminsdk-fbsvc-f09210c94e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Routers
const productRouter = require('./routes/product');
const cartItemsRouter = require('./routes/cart-item');
const customerRouter = require('./routes/customer');
const authRouter = require("./routes/auth");
const adminRoutes = require("./routes/adminRoute");
const cartRouter = require("./routes/cart");
const announcementRouter = require("./routes/announcement");
const paymentRouter = require("./routes/paystack");
const ordersRouter = require("./routes/orders");




// Middleware
const firebaseAuth = require('./middleware/firebaseAuth');

const app = express();

// Cookie + CORS
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5500',
    'http://localhost:5501'
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan('tiny'));

// Disable COOP/COEP for local dev
app.disable("crossOriginOpenerPolicy");
app.disable("crossOriginEmbedderPolicy");
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*", "https://js.paystack.co"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "*"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],

      // Allow iframes from these sources (e.g. Paystack checkout, Google sign-in)
      frameSrc: [
        "'self'",
        "https://checkout.paystack.com",
        "https://js.paystack.co",
        "https://apis.google.com",
        "https://*.firebaseapp.com",
        "https://*.googleusercontent.com"
      ],

      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  })
);




// Test protected route
app.get("/protected", firebaseAuth, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Auth routes
app.use("/v1/auth", authRouter);

// Static images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// ENV
const API = process.env.API || '/api';
const PORT = process.env.PORT || 5000;

// API routes
app.use(`${API}/product`, productRouter);
app.use(`${API}/cartItems`, cartItemsRouter);
app.use(`${API}/customer`, customerRouter);
app.use(`${API}/cart`, cartRouter);
app.use(`${API}/announcement`, announcementRouter);
app.use(`${API}/paystack`, paymentRouter);
app.use(`${API}/orders`, ordersRouter);
app.use("/v1/admin", adminRoutes);





// Serve frontend files from /public
app.use(express.static(path.join(__dirname, "../public")));






// Start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('DATABASE is connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

startServer();
