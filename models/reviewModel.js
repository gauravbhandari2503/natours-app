const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review Cannot be empty!!!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,   // it will never show this field while sending the response
    },
    tour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        }
    ],
    user: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    ]
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'user',
    //     select: 'name photo'
    // }).populate({
    //     path: 'tour',
    //     select: 'name'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

reviewSchema.index({ tour: 1, user:1}, { unique: true}); // each combination of tour and user has to be unique

reviewSchema.statics.calcAverageRatings = async function(tourId){   // statics method point to current model 
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ])
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', function() {
    // this points to current review
    // this.constructor - points to the model 
    this.constructor.calcAverageRatings(this.tour);
});

// finOneAnd will work for both findByIdAndDelete and findByIdAndUpdate
// we cannot call calcAverageRatings for post middleware of hook fineOneAnd, because it doesnt point to current review for the we need to 
// find a solution for that , below is how we can achieve it.
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // this points to current query
    this.r = await this.findOne(); // we didnt used this in below post middleware as the query is already executed.
    next();
});
// this pre middleware value can be accessed in post middleware, and static method can be only called by model, so we can access the model
// by using contructor on the query passed from pre middleware.
reviewSchema.post(/^findOneAnd/, async function(next) {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review =  mongoose.model('Review', reviewSchema);
module.exports = Review;