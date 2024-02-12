const https = require('https');
require('dotenv').config();
const PaytweakWrapper = require('../config/paytweak');
const Order = require('../models/Order');

let connectionResults = null;

const createPayment = async (req, res) => {
  const paytweak = new PaytweakWrapper(process.env.PAYTWEAK_PUBLIC_KEY, process.env.PAYTWEAK_SECRET_KEY);
  // if (!connectionResults || isTokenExpired(connectionResults.birthToken)) {
    connectionResults = await paytweak.apiConnect();
  // }

  const cartData = req.body.cart.map(product => {
    return {
      id: product.product, 
      description: "", 
      amount: product.price, 
      quantity: product.amount, 
    };
  })

  if (connectionResults.workToken) {
    const paymentData = {
      'order_id': req.body.order_id,
      'amount': Number(req.body.amount),
      'cart': JSON.stringify(cartData),
    };

    try {
      const paymentRequestResults = await paytweak.makePayments(paymentData);
      let useThisPayment = JSON.parse(paymentRequestResults)
      const order = await Order.findOne({ _id: paymentData.order_id });

      if (!order) {
        throw new CustomError.NotFoundError(`No order with id: ${paymentData.order_id}`);
      }

      order.paymentIntentId = useThisPayment.url.split('/')[3]
      await order.save();

      res.status(200).json({ url: useThisPayment.url });
    } catch (error) {
      console.error('Errore durante la richiesta di pagamento:', error);
      // Puoi gestire gli errori di pagamento qui
      res.status(500).json({ success: false, message: 'Errore durante la richiesta di pagamento', error: error.message });
    }
  } else {
    console.log('La chiave non è stata creata correttamente o è scaduta.');
    res.status(500).json({ success: false, message: 'Chiave non valida o scaduta' });
  }
};

function isTokenExpired(birthToken) {
  const birthTimestamp = new Date(birthToken);
  const currentTimestamp = new Date();
  const differenceInMinutes = (currentTimestamp - birthTimestamp) / (1000 * 60);
  return differenceInMinutes >= 10; // Restituisci true se la chiave è scaduta
}

const paymentCallBack = async (req, res) => {
  const { order_id: orderId, status: theStatus } = req.body;

  let orderStatus = '';

  if (theStatus == 5) {
    orderStatus = 'paid'
  } else {
    orderStatus = 'failed'
  }

  try {
    const order = await Order.findOne({ _id: orderId });

    console.log(order, 'did i find the order?');
    if (!order) {
      throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }

    order.status = orderStatus;

    await order.save();
    console.log(order, 'the order is updated?');

    res.send('Order status updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating order status');
  }
};

module.exports = {
  createPayment,
  paymentCallBack
};
