const express = require('express');
const router = express.Router();

const { createPayment,
        paymentCallBack
} = require('../controllers/paymentController');

router
    .route('/')
    .post(createPayment);

router
    .route('/callback')
    .post(paymentCallBack)


module.exports = router;
