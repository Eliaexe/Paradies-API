const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
      mode: 'payment', 
      success_url: `${process.env.CLIENT_URL}/profile`, 
      cancel_url: `${process.env.CLIENT_URL}/cart`, 
    });
    
    // Esegui il console.log dell'URL
    console.log("URL della pagina di checkout:", session.url);

    // Effettua la reindirizzamento verso la pagina di checkout di Stripe
    // res.redirect(303, session.url);
    res.status(200).json({ redirectUrl: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la creazione della sessione di checkout' });
  }
}

module.exports = {
  createCheckoutSession,
};
