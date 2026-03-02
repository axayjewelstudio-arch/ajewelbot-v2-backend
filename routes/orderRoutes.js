const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.post('/confirm-payment', orderController.confirmPayment);
router.post('/mark-ready', orderController.markOrderReady);

module.exports = router;
