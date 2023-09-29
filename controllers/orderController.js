require('dotenv').config();
const Order = require('../models/Order');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (eventData, cart) => {
  const { amount, currency, items, user, id } = eventData;
  // console.log(cart);
  // const { items: cartItems, tax, shippingFee } = req.body;

  // if (!cartItems || cartItems.length < 1) {
  //   throw new CustomError.BadRequestError('No cart items provided');
  // }
  // if (!tax || !shippingFee) {
  //   throw new CustomError.BadRequestError(
  //     'Please provide tax and shipping fee'
  //   );
  // }

  // let orderItems = [];
  // let subtotal = 0;

  // for (const item of cartItems) {
  //   const dbProduct = await Product.findOne({ _id: item._id });
  //   if (!dbProduct) {
  //     throw new CustomError.NotFoundError(
  //       `No product with id : ${item._id}`
  //     );
  //   }

  //   const { name, price, image, _id } = dbProduct;
  //   const singleOrderItem = {
  //     amount: item.quantity,
  //     name,
  //     price,
  //     image,
  //     product: _id,
  //   };
  //   // Aggiungi l'articolo all'ordine
  //   orderItems.push(singleOrderItem);
  //   // Calcola il totale parziale
  //   subtotal += item.quantity * price;
  // }
  // // Calcola il totale
  // const total = tax + shippingFee + subtotal;

  // // Crea un PaymentIntent con Stripe
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: total,
  //   currency: 'eur',
  // });

  // // Genera il link QR
  // const qrCodeData = `https://tuo-sito.com/confirm-order?orderId=${order._id}`;

  // try {
  //   const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
  //   const qrCodeBase64 = qrCodeBuffer.toString('base64');

  //   // Crea l'ordine con il link QR associato
  //   const order = await Order.create({
  //     orderItems,
  //     total,
  //     subtotal,
  //     tax,
  //     shippingFee,
  //     clientSecret: paymentIntent.client_secret,
  //     user: req.user.userId,
  //     qrCode: qrCodeBase64, // Associa il link QR all'ordine
  //   });

  //   res
  //     .status(StatusCodes.CREATED)
  //     .json({ order, clientSecret: order.clientSecret });
  // } catch (error) {
  //   console.error('Errore nella generazione del QR code:', error);
  //   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore nella generazione del QR code' });
  // }
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
