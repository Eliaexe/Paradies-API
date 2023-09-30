const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const { createOrder } = require('./orderController')

async function createCheckoutSession(req, res) {
  try {
    const products = req.body.products; 
    const session = await stripe.checkout.sessions.create({
      line_items: products.map(product => ({
        price_data: {
          currency: 'USD', 
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100, 
        },
        quantity: product.quantity,
      })),
      mode: 'payment' , 
      success_url: `${process.env.CLIENT_URL}`, 
      cancel_url: `${process.env.CLIENT_URL}cart`, 
    });
    const lineItems = session.total_details.line_items;
    const paymentId = session.id
    // console.log(paymentIntentId);
    // console.log(req.body);
    await createOrder(req, res, paymentId)
    // Effettua la reindirizzamento verso la pagina di checkout di Stripe
    // res.redirect(303, session.url);
    res.status(200).json({ redirectUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la creazione della sessione di checkout' });
  }
}

module.exports = {
  createCheckoutSession,
};
