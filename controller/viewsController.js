const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.getOverview = catchAsync( async(req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('tour', {
            title: tour.name,
            tour
        });
});

exports.getLoginForm = (req, res, next) => {
    res.status(200)
        .set( 
            'Content-Security-Policy', 
            "script-src 'self' https://cdnjs.cloudflare.com" )
        .render('login', {
            title: 'Login into your account'
        })
};

exports.getSignupForm = (req, res, next) => {
    res.status(200)
        .set( 
            'Content-Security-Policy', 
            "script-src 'self' https://cdnjs.cloudflare.com" )
        .render('signup', {
            title: 'Signup'
        })
};

exports.getAccount = (req, res) => {
    res.status(200)
        .render('account', {
            title: 'Account'
        });
}

exports.updateUserData = catchAsync( async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200)
        .render('account', {
            title: 'Account',
            user: user
        });
});