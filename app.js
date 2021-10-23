const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// this express.static is used to open files that are supported by browsers.
app.use(express.static(`${__dirname}/public`));

//1) Global Middlewares 

// Set secuitry http header
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Api rate limiting
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many request from this ip, Please try again in an hour'
});

app.use('/api', limiter);

// Body parser, reading data from the body into req body
app.use(express.json({
    limit: '10kb'
}));

// Data sanitization against NoSQL query injection :EX => in postman keep the password correct and use this "email": {"$gt":""}
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (hpp: http parament pollution)
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

// 3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));  // anything passed to next is understandable that it is an error and it will send the error to the global error handling middleware
})

// Error handling middleware
app.use(globalErrorHandler);

// 4) SERVER
module.exports = app;