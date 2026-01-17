require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const productRouter = require('./routes/product');

const app = express();

// middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());
app.use(morgan('tiny'));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // allow inline scripts
      imgSrc: ["'self'", "http://localhost:5000", "data:"],
      connectSrc: ["'self'", "http://localhost:5000"],
    }
  })
);


// static images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// env variables
const API = process.env.API || '/api';
const PORT = process.env.PORT || 5000;

// routes
app.use(`${API}/product`, productRouter);















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
