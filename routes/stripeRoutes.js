const express = require('express');
const router = express.Router();

const { handleStripeWebhook } = require('../controllers/stripeController');

router.post('/', handleStripeWebhook);

module.exports = router;
