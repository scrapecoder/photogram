const mongoose = require('mongoose');

const taskSchema  = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:String,
    description:String,
    taskImage:{type:String, required:true},
    userId:String
})


module.exports = mongoose.model('Task', taskSchema)