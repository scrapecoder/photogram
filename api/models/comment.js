const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    createdAt:{type:Date, default:Date.now},
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } // For nested comments
});

module.exports = mongoose.model('Comment', commentSchema);
