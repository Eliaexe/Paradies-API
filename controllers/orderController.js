require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('../utils');
const CustomError = require('../errors');
const QRCode = require('qrcode')
const Order = require('../models/Order');
const Local = require('../models/Local')

const createOrder = async (req, res, io) => {

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
      clientSecret: `${localId._id}%${customerId}%${Date.now()}`,
      user: customerId,
      qrCode: 'placeholder',
      status: 'paid'
    });

    const orderId = order._id;
    const orderSecret = order.clientSecret

    const qrCodeData = `${orderId}#${orderSecret}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');

    order.qrCode = qrCodeBase64;
    await order.save();
    req.io.emit('newOrder', order);

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
  const cacheDisabled = true;
  const { value } = req.params;

  let criteria = {}
  const searchCriteria = () => {
    if (value.length == 24) {
      criteria = {'_id': value}
    } else {
      criteria = {'paymentIntentId': value}
    }
  }
 
  const order = await Order.findOne(criteria);

  if (!order) {
    throw new CustomError.NotFoundError(
      `No order found matching either _id: '${id}' or paymentIntentId: '${paymentIntentId}'`
    );
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getOrderPaymentStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ paymentIntentId: id });

    if (!order) {
      throw new CustomError.NotFoundError(`No order found with payment intent id: ${id}`);
    }

    res.status(StatusCodes.OK).json({ order });
  } catch (error) {
    console.error('Error fetching order payment status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
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

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  getOrderPaymentStatus
};
