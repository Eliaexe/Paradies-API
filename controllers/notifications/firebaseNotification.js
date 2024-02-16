const admin = require('firebase-admin');

// Inizializzazione di Firebase Admin SDK (modifica con le tue credenziali)
const serviceAccount = {
    apiKey: process.env.FIREBASEapiKey,
    authDomain: process.env.FIREBASEauthDomain, 
    projectId: process.env.FIREBASEprojectId,
    storageBucket: process.env.FIREBASEstorageBucket,
    messagingSenderId:process.env.FIREBASEmessagingSenderId,
    measurementId:  process.env.FIREBASEmeasurementId
};
  
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Funzione per inviare notifiche a un dispositivo (modifica il nome)
async function sendNotificationToDevice(token, payload) {
  try {
    await admin.messaging().sendToDevice(token, payload);
    console.log('Notifica inviata con successo al dispositivo:', token);
  } catch (error) {
    console.error("Errore durante l'invio della notifica:", error);
  }
}

// Funzione per inviare notifiche a un topic (modifica il nome)
async function sendNotificationToTopic(topic, payload) {
  try {
    await admin.messaging().sendToTopic(topic, payload);
    console.log('Notifica inviata con successo al topic:', topic);
  } catch (error) {
    console.error("Errore durante l'invio della notifica:", error);
  }
}

// Esempio di payload di notifica (modifica i contenuti)
const payload = {
  notification: {
    title: 'Titolo della notifica',
    body: 'Corpo della notifica',
  },
};

// Esempio di invio a un dispositivo (modifica il token)
const token = 'token_dispositivo';
sendNotificationToDevice(token, payload);

// Esempio di invio a un topic (modifica il nome del topic)
const topic = 'test';
sendNotificationToTopic(topic, payload);

// Esporta le funzioni per l'utilizzo in altri moduli (modifica i nomi)
module.exports = {
  sendNotificationToDevice,
  sendNotificationToTopic,
};
