require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const customerRouter = require('./routes/customer');
const { firebaseAuthMiddleware } = require('./middleware/firebaseMiddleware');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/auth");
const adminRoutes = require("./routes/adminRoute");

const app = express();


// middleware
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501'
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan('tiny'));
app.disable("crossOriginOpenerPolicy");
app.disable("crossOriginEmbedderPolicy");
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*"],
      connectSrc: ["'self'", "*"],
      imgSrc: ["'self'", "*", "data:"]
    }
  })
);
app.get("/protected", firebaseAuthMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});
app.use("/auth", authRouter);
app.use('/images', express.static(path.join(__dirname, '../public/images')));



// env variables
const API = process.env.API || '/api';
const PORT = process.env.PORT || 5000;

// routes
app.use(`${API}/product`, productRouter);
app.use(`${API}/cart`, cartRouter);
app.use(`${API}/customer`, customerRouter);
app.use(`${API}/`, adminRoutes);  




// start server
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

