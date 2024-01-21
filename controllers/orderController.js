require('dotenv').config();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Local = require('../models/Local')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const QRCode = require('qrcode')

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res, clientSecret) => {

    try {
      const { localId, products, customerId } = req.body;
  
      if (!products || products.length < 1) {
        throw new CustomError.BadRequestError('No cart items provided');
      }
  
      const orderItems = [];
      let total = 0;
  
      for (const item of products) {
        const dbLocal = await Local.findOne({ _id: localId });
  
        if (!dbLocal) {
          throw new CustomError.NotFoundError(`Local with id : ${localId} not found`);
        }
  
        const localInventory = dbLocal.inventory.filter((product) => product.id === item._id);
  
        if (localInventory.length === 0 || localInventory[0].quantity < item.quantity) {
          throw new CustomError.BadRequestError(`Product with id : ${item._id} not available in the local's inventory`);
        }
  
        const singleOrderItem = {
          amount: item.quantity,
          name: localInventory[0].name,
          price: localInventory[0].price,
          image: localInventory[0].image,
          product: item._id,
        };
  
        orderItems.push(singleOrderItem);
        total += item.quantity * localInventory[0].price;
      }
      
      const order = await Order.create({
        orderItems,
        total,
        local: localId,
        clientSecret: `${localId}%${customerId}%${Date.now()}`,
        user: customerId,
        qrCode: 'placeholder'
      });

  
      const orderId = order._id;
  
      const qrCodeData = `https://paradies-api.onrender.com/api/v1/orders/confirmOrder?id=${orderId}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
      const qrCodeBase64 = qrCodeBuffer.toString('base64');
  
      order.qrCode = qrCodeBase64;
      await order.save();
  
      // console.log('Order created successfully:', order);
  
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: { order, clientSecret: order.clientSecret },
      });
    } catch (error) {
      console.error('Error creating order:', error);
  
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Error creating order',
          details: error.message,
        },
      });
    }
}
  

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
  let orders
  if(req.user.role === 'client') {
    orders = await Order.find({ user: req.user.userId });
  } else if (req.user.role === 'business') {
    const local = await Local.find({ owner: req.user.userId })
    orders = await Order.find({ local: local[0]._id});
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId, status: orderStatus } = req.params;
  // const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  // checkPermissions(req.user, order.user);

  // order.paymentIntentId = paymentIntentId;
  order.status = orderStatus;
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

const confirmOrder = async (req, res) => {
  const { id: orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }

    order.status = 'delivered';

    await order.save();

    res.status(StatusCodes.OK).json({ order });
  } catch (error) {
    console.error('Error confirming order:', error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  confirmOrder
};
