const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     });
// }) 

exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, {
    path: 'reviews',
})

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     if (!updatedTour) {
//         return next(new AppError('No tour found with that id',404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             updatedTour
//         }
//     })
// })

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const deletedTour = await Tour.findByIdAndDelete(req.params.id)

//     if (!deletedTour) {
//         return next(new AppError('No tour found with that id',404));
//     }

//     res.status(204).json({
//         status: 'success'
//     });
// })

exports.deleteTour = factory.deleteOne(Tour);     // above code is put on a function that is called factory function

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1},
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => { 
    const year = req.params.year * 1 ;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' // it makes a document seprate for each array fields
        },
        {
            $match: { 
                startDates: { 
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1},
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });

})

