require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();

// Resto dei pacchetti (Middleware e altro)
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
// const rateLimiter = require('express-rate-limit');
const multer = require('multer')
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
const orderRouter = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes')
const localsRoutes = require('./routes/localsRoutes')
const uploadRouter = require('./routes/uploadRouter')
const mainRouter = require('./routes/mainRoutes')

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const corsOptions = {
  origin: ['http://localhost:3000', 'https://paradis-sand.vercel.app', 'https://nextjs-paradis.vercel.app' ],
  credentials: true, 
};

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);


const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });



app.set('trust proxy', 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://ptwkdev.link/', 'eliaexe.github.io'],
      styleSrc: ["'self'", 'https://ptwkdev.link/', 'unsafe-inline'], 
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


// MULTER 

app.use(fileUpload());

// Auth whit Passport.js 

// passportConfig(passport);


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', userRouter);
app.use('/api/v1/locals', localsRoutes)
// app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/main', mainRouter)
app.post('/api/v1/upload', upload.single('image'), (req, res) => {
  console.log(req);
  if (req.file) {
    res.json({
      success: true,
      message: 'File caricato correttamente',
      file: req.file.filename
    });
  } else {
    res.json({
      success: false,
      message: 'Errore durante il caricamento del file'
    });
  }
});

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
