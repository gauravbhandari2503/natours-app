const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${JSON.stringify(err.keyValue)}. Please use another value`
    return new AppError(message, 400)
}
const sendErrorDev = (err, req, res) => {

    // error for api's
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        })
    }
    // Rendered website
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })

    
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    console.log(typeof errors)
    const message = `Invalid Input Data. ${errors.join('. ')}`;
    
    return new AppError(message, 400)
}

const handleJwtError = () => new AppError('Invalid Token, Please log in again', 401);
const handleJwtExpiredError = () => new AppError('Your Token has expired', 401);

const sendErrorProd = (err, req, res) => {
    // error for api's
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        // Programming or other unknown Error: don't want to leak error details
        }
        // 1) Log error
        console.error('Error', err);
        // 2) Send Generic message
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong"
        })
    }
    // error for rendered page
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg:  'Please try again later'
    })
    
}

// Error handling middleware

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err};
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error) 
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJwtError()
        if (error.name === 'TokenExpiredError') error = handleJwtExpiredError()

        sendErrorProd(error, req, res)
    }
}