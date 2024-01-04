// Importa i moduli necessari
// const Order = require('../models/Order');
// const QRCode = require('../models/QRCode');
// const qrcode = require('qrcode');

// const Order = require('../models/Product');

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definisci la funzione per creare un nuovo ordine con codice QR
const createOrderWithQR = async (paymentID) => {
  try {
    const newOrder = new Order({
      // Altri campi dell'ordine
      // ...
    });

    // Salva l'ordine nel database
    await newOrder.save();

    // Genera un codice QR basato sull'ID dell'ordine
    const qrData = newOrder._id.toString();
    const qrCode = await qrcode.toDataURL(qrData);

    // Crea un documento del codice QR nel database
    const newQRCode = new QRCode({
      code: qrCode,
      // Altri metadati se necessario
      // ...
    });

    // Salva il codice QR nel database
    await newQRCode.save();

    // Associa il codice QR all'ordine
    newOrder.qrCodeId = newQRCode._id;
    await newOrder.save();

    // Restituisci l'ordine creato
    return newOrder;
  } catch (error) {
    console.error(error);
    throw new Error('Errore nella creazione dell\'ordine');
  }
};

// Esporta la funzione per poterla utilizzare altrove nel tuo backend
module.exports = {
  createOrderWithQR,
};
