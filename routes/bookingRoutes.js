const express = require('express');
const router = express.Router();
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');


router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

module.exports = router;