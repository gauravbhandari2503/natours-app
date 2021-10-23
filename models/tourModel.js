const mongoose = require('mongoose'); 
const slugify = require('slugify');
const validator = require('validator');  // external library 

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'A Tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A Tour name must have less or equal then 40 characters'],
        minLength: [10, 'A Tour name must have more or equal then 10 characters'],
    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true,'A Tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true,'A Tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true,'A Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium','difficult'],
            message: 'Difficulty is either easy, medium, or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A Tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            },
            message: `Discount price ({VALUE}) cannot be more than the actual price`
        }, 
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour must have a cover image']
    },
    images: [String], // array of strings
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,   // it will never show this field while sending the response
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {   // Embedded object
        // GeoJson
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

tourSchema.index({price: 1, ratingsAverage: -1})  // Indexing helps in querying the result faster, to examine your query use 

tourSchema.virtual('durationWeeks').get(function() {   // whenever we want to use this keyword never use arrorw funtion
    return this.duration/7;
})

// Virtaul populate - Generally used for parent referencing
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// Document middleware - it runs before the .save() and .create() only.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})

// Embedding guides in tours document
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))   // will return array of promises
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// It's called pre save hook or pre save middleware, and there can be more than 1 pre save hook

// tourSchema.post('save',function(doc, next) {
//     console.log(doc);
//     next();
// })

// Query Middleware - it run before the find() and this keyword will point the current query 
tourSchema.pre(/^find/, function(next) {   // ^find(regular expression) means that it will work for every find method.
    this.find({secretTour: {$ne: true }});
    next();
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})
// tourSchema.post(/^find/, function(docs, next){
//     console.log(docs);
//     next();
// })


// Aggregation Middleware 
tourSchema.pre('aggregate', function(next) {  // this object point to current aggregate function
  this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
  next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;