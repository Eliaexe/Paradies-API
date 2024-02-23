const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configurazione per multer (modulo per gestire il caricamento di file)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/';
    // Verifica se la cartella di destinazione esiste, altrimenti crea la cartella
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Elabora l'upload dell'immagine
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    
    const fileName = req.file.filename;
    res.status(200).json({ fileName });
  } catch (error) {
    console.error('Errore durante l\'upload del file:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante l\'upload del file' });
  }
});

module.exports = router;
