const path = require('path');

const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato.' });
    }

    const filePath = path.join('uploads', req.file.filename);

    res.status(200).json({ filePath });
  } catch (error) {
    console.error('Errore durante l\'upload del file:', error);
    res.status(500).json({ error: 'Errore durante l\'upload del file.' });
  }
};

module.exports = { uploadFile };
