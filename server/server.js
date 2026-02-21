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
const cartRouter = require('./routes/cart');
const customerRouter = require('./routes/customer');
const authRouter = require("./routes/auth");
const adminRoutes = require("./routes/adminRoute");

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

// Helmet CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*"],
      connectSrc: [
        "'self'",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "*"
      ],
      imgSrc: ["'self'", "*", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
);

// ⭐ Serve frontend files from /public

app.use(express.static(path.join(__dirname, "../public")));


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
app.use(`${API}/cart`, cartRouter);
app.use(`${API}/customer`, customerRouter);

// Admin routes
app.use("/v1/admin", adminRoutes);

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
