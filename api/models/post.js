const mongoose = require('mongoose');

const postSchema  = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    postImage:{type:String, required:true},
    assignedTo: [{ type: mongoose.Types.ObjectId, ref: 'Users' }],
    createdBy: { type: mongoose.Types.ObjectId, ref: 'Users',required:true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    commentedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    createdAt:{type:Date, default:Date.now},
    postCaption:String,
    userId:String, 
})
module.exports = mongoose.model('Post', postSchema)