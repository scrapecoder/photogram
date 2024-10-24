const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, match: /[A-Z0-9a-z._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,64}/ },
    password: { type: String, required: true },
    verified: Boolean,
    circle: [{
        user: { type: mongoose.Types.ObjectId, ref: "Users" },
        status: { type: Number, default: 0 } // 0: Pending, 1: Accepted, -1: Rejected
    }],
    chatId:String
});

module.exports = mongoose.model('Users', UserSchema)



