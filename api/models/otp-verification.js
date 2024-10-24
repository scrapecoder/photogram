const mongoose = require('mongoose');
const OtpVerification = mongoose.Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiredAt:Date
})
module.exports = mongoose.model('OtpVerification', OtpVerification)