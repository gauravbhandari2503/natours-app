const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// param middleware function are those function which only work for specific param in a route. EX- given below.
// router.param('id', tourController.checkId);

// Nested routes with different routing file
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours')
    .get(tourController.aliasTopTours,tourController.getAllTours);

router.route('/monthly-plan/:year')
    .get(authController.protect,  authController.restrictTo('admin','tour-guide', 'guide'), tourController.getMonthlyPlan);

router.route('/tour-stats')
    .get(authController.protect, tourController.getTourStats);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.protect,  authController.restrictTo('admin','tour-guide'), tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,  authController.restrictTo('admin','tour-guide'), tourController.updateTour)
    .delete(authController.protect,  authController.restrictTo('admin','tour-guide'), tourController.deleteTour);

// Nested post route
// router.route('/:tourId/reviews')
//     .post(authController.protect, authController.restrictTo('user'),reviewController.createReview)


module.exports = router