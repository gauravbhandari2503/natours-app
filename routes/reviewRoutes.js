const express = require('express');
const router = express.Router( {
    mergeParams: true               // Provides access to id's of other router
});
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');

router.use(authController.protect);

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;