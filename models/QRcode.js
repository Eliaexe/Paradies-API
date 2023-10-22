const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  // Il codice QR stesso (in formato base64 o l'URL del codice QR)
  code: String,

  // Eventuali metadati aggiuntivi
  // ...
});

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode;
