require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

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
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

 
    if (allowedOrigins.includes(origin)) return callback(null, true);

   
    return callback(new Error("Not allowed by CORS"));
  },
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
      scriptSrc: ["'self'", "'unsafe-inline'","'unsafe-eval'", "https://apis.google.com", "https://cdn.jsdelivr.net", "https://www.gstatic.com", "https://js.paystack.co"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: [
        "'self'",
        ...(process.env.NODE_ENV === 'development'
            ? ["http://localhost:5000", "http://127.0.0.1:5000", "https://mums-needs-production.up.railway.app"]
            : []),
        "https://*.firebaseio.com",
        "https://*.firebaseapp.com",
        "https://apis.google.com",
        "https://securetoken.googleapis.com",
        "https://www.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://mums-needs-production.up.railway.app",
        "https://api.paystack.co"
      ],
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
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Serve frontend files from /public
app.use(express.static(path.join(process.cwd(), 'public')));
// ENV
const API = process.env.API ;
const PORT = process.env.PORT || 5000;

// API routes
app.use(`${API}/product`, productRouter);
app.use(`${API}/cartItems`, cartItemsRouter);
app.use(`${API}/customer`, customerRouter);
app.use(`${API}/cart`, cartRouter);
app.use(`${API}/announcement`, announcementRouter);
app.use(`${API}/paystack`, paymentRouter);
app.use(`${API}/orders`, ordersRouter);
app.use(`${API}/admin`, adminRoutes);












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
