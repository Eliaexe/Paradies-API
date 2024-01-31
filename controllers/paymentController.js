const https = require('https');
require('dotenv').config();
const PaytweakWrapper = require('./paytweak'); // Assicurati di fornire il percorso corretto al tuo file PaytweakWrapper

const createPayment = (req, res) => {

  // Example usage
  console.log(process.env.PAYTWEAK_PUBLIC_KEY);
  const paytweak = new PaytweakWrapper(process.env.PAYTWEAK_PUBLIC_KEY, process.env.PAYTWEAK_SECRET_KEY);
  paytweak.apiConnect();


};

module.exports = {
  createPayment,
};
