const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), uploadController.uploadFile);

module.exports = router;
