const express = require('express');
const router = express.Router();

const { createPayment } = require('../controllers/paymentController');

router
    .route('/')
    .post(createPayment);


module.exports = router;
