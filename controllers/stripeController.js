require('dotenv').config();
const Order = require('../models/Order');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const { createOrderWithQR } = require('../controllers/createOrderWithQRController');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const webhookHandlers = {
  'charge.succeeded': async (event) => {

  },
  'payment_intent.succeeded': async (event) => {
    const session = event.data.object;
    const lineItems = session.display_items
    const createdOrder = await createOrderWithQR(session.id);

    const retriveSession = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand : ['line_items'],
      }
    );

    console.log(retriveSession);
  },
  'payment_intent.payment_failed': async (data) => {
    // Aggiungi la tua logica di business qui
    console.log('Fail:', data);
  },
};

const handleStripeWebhook = async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(
      req['rawBody'],
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    await webhookHandlers[event.type](event);
    res.send({received: true});
  } catch (err) {
    console.error(err)
    // res.status(400).send(`Webhook Error: ${err.message}`);
  }      
};

module.exports = {
  handleStripeWebhook,
};