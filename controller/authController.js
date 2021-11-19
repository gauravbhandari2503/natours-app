const {promisify} = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined;
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createAndSendToken(newUser, 201, res);
    next();
});

exports.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;

    //1) Chek email and password
    if (!email || !password) {
        return next(new AppError('please provide email and password', 400));
    }
    //2) Check if user exists && password is correct 
    const user = await User.findOne({email}).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //3) If everything is correct, send json token
    createAndSendToken(user, 200, res);
});


exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    
    res.status(200).json({
        status: 'success'
    })
}
// Protecting the routes using the middleware
exports.protect = catchAsync(async(req, res, next) => {
    let token;

    // 1) Getting the jwt token and check if it's exist
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access.',401))
    }

    // 2) Validate the token (Verification)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check user still exists?
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError(`The user belonging to the token doesn't exist`,401))
    }
    // 4) Check if user changed password after the jwt token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError(`Password changed recently! Please login again`),401)
    }

    // Grant access to protect routes
    req.user = currentUser;
    res.locals.user = currentUser;
    next()
})


// Roles and permission

exports.restrictTo = (...roles) => {       //Arbitary function that can take number of arguments and store them to array
    return (req, res, next) => {
        // roles is an array
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action',403))
        }
        next();
    }
}

exports.forgetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with this email', 404))
    }
    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    // 3) Send it to user's email 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetUrl} .\n If you didnt forget your password please ignore this email`;
    
    // try {
    //     await sendEmail({
    //         email: user.email,
    //         subject: 'Your password reset token (valid for 10 minutes)',
    //         message
    //     });
    
    //     res.status(200).json({
    //         status: 'success',
    //         message: 'Token to send to email!'
    //     })
    // } catch (err) {
    //     user.passwordResetToken = undefined;
    //     user.passwordResetExpires = undefined;
    //     await user.save({ validateBeforeSave: false });
    //     return next(new AppError('There was an error sending the email, try again later',500))
    // }
    next();
})

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2) If token has not expired, and there is user, set new password
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
            }
        }
    );
    if (!user) {
        return next(new AppError('Token is invalid or expired',400))
    }

    // 3) Update changePasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
   
    // 4) Log the user in, send JWT
    await user.save();
    createAndSendToken(user, 200, res);
    next();
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted current password is correct
    const {currentPassword, newPassword, newPasswordConfirm} = req.body;
    if (!(await user.correctPassword(currentPassword, user.password)) ) {
        return next(new AppError('Current password doesnt match',401));
    }

    // 3) If so, update the password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // 4) Log user in, send JWT 
    createAndSendToken(user, 200, res);
    next();
});


// Only for rendered pages and there will be no errors
exports.isLoggedIn = async(req, res, next) => {
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;

            // 1)Verifies token 
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
            // 2) Check user still exists?
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
            return next();
            }
            // 3) Check if user changed password after the jwt token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a logged in user
            res.locals.user = currentUser
            return next()
        } catch (err) {
            return next()
        }
    }
    next();
};

