const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}
exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async(req, res, next) => {
    // FIltered out unwanted fields that are not allowed to updated
    const filterdBody = filterObj(req.body, 'name', 'email');

    // 1) Create Error if user post password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates, please use /change-password route to update your password', 400));
    }

    // 2) Update User document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
        new: true, runValidatory: true
    });
    res.status(200).json({
        status: 'success',
        user: updatedUser
    })
    next();
})

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false} );
    res.status(204).json({
        status: 'success',
        data: 'null'
    })
    next();
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);  // Only for administrator

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined! Please use /signup route for signing in.'
    })
};


exports.deleteUser = factory.deleteOne(User); // Only for administrator
