const express = require('express');
const router = express.Router();
const { io } = require('../app'); 

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  confirmOrder,
  getOrderPaymentStatus
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, (req, res, io) => createOrder(req, res, io))
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);


router
  .route('/showAllMyOrders')
  .get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .get(authenticateUser, confirmOrder)
  .patch(authenticateUser, updateOrder);

router
  .route('/paymentStatus/:id')
  .get(authenticateUser, getOrderPaymentStatus)

router
  .route('/confirmOrder/:id')
  .get(authenticateUser, confirmOrder);

module.exports = router;
