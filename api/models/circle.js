const mongoose = require('mongoose')

const CircleSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    request:{type:mongoose.Schema.Types.Number, default:0} // 0: Pending, 1: Accepted, -1: Rejected
})

module.exports = mongoose.model('Circle', CircleSchema)

