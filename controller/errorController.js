const AppError = require('./../utils/appError');
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${JSON.stringify(err.keyValue)}. Please use another value`
    return new AppError(message, 400)
}
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
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

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    // Programming or other unknown Error: don't want to leak error details
    } else {
        // 1) Log error
        console.error('Error', err);
        // 2) Send Generic message
        res.status(500).json({
            status: "error",
            message: "Something went very wrong"
        })
    }
    
}

// Error handling middleware

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err};
        if (error.name === 'CastError') error = handleCastErrorDB(error) 
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJwtError()
        if (error.name === 'TokenExpiredError') error = handleJwtExpiredError()
        sendErrorProd(error, res)
    }
}