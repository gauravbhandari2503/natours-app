const mongoose = require('mongoose'); 
const slugify = require('slugify');
const validator = require('validator');  // external library
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'A User must have a name'],
        trim: true,
        maxLength: [40, 'A User name must have less or equal then 40 characters'],
        minLength: [10, 'A User name must have more or equal then 10 characters'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'A User must have an email'],
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [8,'A password must have atleast 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on Create or Save
            validator: function(val) {
                return val === this.password;
            },
            message: 'Confirm password didnt matched'
        }
    },
    passwordChangedAt:{
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Document middleware - it runs before the .save() and .create() only.
userSchema.pre('save', async function(next) {
    // only run this if password is modified
    if(!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password,12);
    // Delete the confirm password
    this.passwordConfirm = undefined;
    next()
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next){
    this.find( {active: { $ne: false}} );
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp;   // 100 < 200 
    }
    return false;
}   

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;   // 10 minutes
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
