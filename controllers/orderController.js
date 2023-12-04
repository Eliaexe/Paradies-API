require('dotenv').config();
const Order = require('../models/Order');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const QRCode = require('qrcode')

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res, clientSecret) => {
  const { products } = req.body;
  const tax = 1;
  const shippingFee = 2;

  if (!products || products.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee'
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of products) {
    const dbProduct = await Product.findOne({ _id: item._id });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item._id}`
      );
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.quantity,
      name,
      price,
      image,
      product: _id,
    };
    orderItems.push(singleOrderItem);
    subtotal += item.quantity * price;
  }

  const total = tax + shippingFee + subtotal;
  try {
    // Genera il link QR ora che hai l'ID dell'ordine
    const qrCodeData = `https://tuo-sito.com/confirm-order?orderId=${clientSecret}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    // Crea l'ordine
    const order = await Order.create({
      orderItems,
      total,
      subtotal,
      tax,
      shippingFee,
      clientSecret: clientSecret,
      user: req.body.userId,
      qrCode: qrCodeBase64
    });

    // // Aggiungi il link QR all'ordine
    order.qrCode = qrCodeBase64;
    await order.save();

    res
      .status(StatusCodes.CREATED)
      .json({ order, clientSecret: order.clientSecret });
  } catch (error) {
    console.error('Errore nella creazione dell\'ordine:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Errore nella creazione dell\'ordine', error });
  }
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
  // const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  // order.paymentIntentId = paymentIntentId;
  order.status = 'delivered';
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
