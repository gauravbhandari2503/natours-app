const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

router.post('/signup',authController.signUp);
router.post('/login',authController.login);
router.get('/logout',authController.logout);


router.post('/forget-password',authController.forgetPassword);
router.patch('/reset-password/:token',authController.resetPassword);

// instead of writing authController.protect in every route we can use a short hand
router.use(authController.protect);

router.patch('/change-password', authController.updatePassword);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);


// Admin functionality - Using middleware 
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router