const express = require('express');
const router = express.Router();

const {
  authenticateUser,
} = require('../middleware/authentication');

const {
  getAllBusinessInformation
} = require('../controllers/mainControllers/dashboardController')

router
  .route('/dashboard/:id')
  .get(authenticateUser, getAllBusinessInformation);

module.exports = router;