const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://paradis-sand.vercel.app', 'https://nextjs-paradis.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Database
const connectDB = require('./db/connect');
    
// Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const localsRoutes = require('./routes/localsRoutes');
const uploadRouter = require('./routes/uploadRouter');
const mainRouter = require('./routes/mainRoutes');

const {verifyBarman,
       handleOrderStatus,
       allRelevanOrders
      } = require('./controllers/socket/barmar')

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const corsOptions = {
  origin: ['http://localhost:3000', 'https://paradis-sand.vercel.app', 'https://nextjs-paradis.vercel.app'],
  credentials: true,
};

// Applicazione del middleware CORS
app.use(cors(corsOptions));

// Impostazioni di sicurezza e altri middleware
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://ptwkdev.link/', 'eliaexe.github.io'],
    styleSrc: ["'self'", 'https://ptwkdev.link/', 'unsafe-inline'],
    imgSrc: ["'self'", 'data:'],
    fontSrc: ["'self'", 'fonts.googleapis.com'],
  },
}));
app.use(xss());
app.use(mongoSanitize());
app.use(express.json({
  verify: (req, res, buffer) => (req['rawBody'] = buffer)
}));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));

// Definizione delle route
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', userRouter);
app.use('/api/v1/locals', localsRoutes);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/main', mainRouter);

// Middleware per la gestione degli errori e route non trovate
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

io.on('connection', async (socket) => {
  const headers = socket.handshake.headers;
  const isVerified = await verifyBarman(headers['user']);

  if (isVerified) {
    socket.emit('ordersToStart', isVerified)
  } else {
    socket.disconnect(true)
  }

  socket.on('confirmOrder', async (data) => {
    let managedOrder = await handleOrderStatus(data, 'delivered', io)

    if (managedOrder == 'error') {
      socket.emit('error', {error: 'error updating order'})
    }
  })

  socket.on('refresh', async (data) => {
    const sendThis = await allRelevanOrders(data)
    socket.emit('ordersToStart', sendThis)
  })

  socket.on('cancelOrder', (data) => {
    handleOrderStatus(data, 'canceled', io)
  })
});

// Avvio del server
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
