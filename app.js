require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();

// Resto dei pacchetti (Middleware e altro)
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
// Passport
// const passport = require('passport');  
// const passportConfig = require('./config/passport-config');

// Database
const connectDB = require('./db/connect');

// Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const checkoutRoute = require('./routes/checkoutRoutes');
const stripeRoute = require('./routes/stripeRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const localsRoutes = require('./routes/localsRoutes')

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const corsOptions = {
  origin: ['https://nextjs-paradis.vercel.app', 'http://localhost:3000' ],
  credentials: true, 
};

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'js.stripe.com', 'eliaexe.github.io'],
      styleSrc: ["'self'", 'js.stripe.com', 'unsafe-inline'], 
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'fonts.googleapis.com'],
    },
  })
);
app.use(cors(corsOptions));
app.use(xss());
app.use(mongoSanitize());

app.use(express.json({
  verify: (req, res, buffer) => (req['rawBody'] = buffer)
}));
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
// app.use(fileUpload());

// Auth whit Passport.js 

// passportConfig(passport);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/checkout', checkoutRoute);
app.use('/api/v1/stripe-webhook', paymentRoutes);
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/locals', localsRoutes)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
