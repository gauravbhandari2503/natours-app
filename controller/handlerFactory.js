const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if (!document) {
        return next(new AppError('No document found with that id',404));
    }

    res.status(204).json({
        status: 'success'
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const updatedDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedDocument) {
        return next(new AppError('No Document found with that id',404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedDocument
        }
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: newDocument
        }
    });
});

exports.getOne = (Model,populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions)  query = query.populate(populateOptions) 

    const document = await query;
    // Tour.findOne({ _id: req.params.id}) long method

    if (!document) {
        return next(new AppError('No document found with that id',404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            document
        }
    })
})

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    // To allow for nested Get Reviews on tour (hack)
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId};
    
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const document = await features.query.explain();
    const document = await features.query;


    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: document.length,
        data: {
            document
        }
    })
})