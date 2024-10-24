const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const Post = require('../models/post');
const PostLike = require('../models/post-like')
const Comment = require('../models/comment')
const Circle = require('../models/circle')
const Users = require('../models/user')


exports.add_post = (req, res, next) => {

    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId; // Assuming user ID is stored in the token payload as 'userId'

    const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        postCaption: req.body.postCaption,
        postImage: req.file.path,
        createdBy: req.body.createdBy,
        userId: userId
    });

    post.save()
        .then(result => {
            res.status(200).json({
                message: "Post created",
                createTask: post
            });
        })
        .catch(err => {

            res.status(500).json({ error: err });
        });
}


exports.get_all_post = (req, res, next) => {

    const page = req.query.page || 1; // Default page is 1
    const perPage = 10; // Number of posts per page
    // Calculate skip value based on current page and posts per page
    const skip = (page - 1) * perPage;
    Post.find()
        .populate('createdBy') // Populate the createdBy field with the full user data
        .skip(skip)
        .limit(perPage)
        .exec()
        .then(posts => {
            // Calculate total pages
            const totalPages = Math.ceil(posts.length / perPage);
            // Return posts along with pagination metadata
            res.status(200).json({
                posts: posts,
                currentPage: page,
                totalPages: totalPages
            });

        })
        .catch(err => {
            console.error('Error fetching all posts:', err);
            res.status(500).json({ error: err });
        });
}

exports.get_post_by_id = (req, res, next) => {
    const id = req.params.taskId;
    Post.findById(id).exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ error: "No Task found with provided id" }); // Changed to status 404
            }
        })
        .catch(err => {
            res.status(500).json({ error: "Something went wrong" });
        });
}

exports.delete_post = (req, res, next) => {
    const id = req.params.taskId;
    Post.deleteOne({ _id: id }).exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: "Something went wrong" });
        });
}

exports.update_post = async (req, res, next) => {
    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already liked the post
        const isLiked = post.likedBy.includes(userId);

        if (isLiked) {
            // If the user has already liked the post, remove the like
            await PostLike.deleteOne({ user: userId, post: postId });
            await Post.findByIdAndUpdate(postId, { $pull: { likedBy: userId } });
            res.status(200).json({ message: 'Like removed successfully' });
        } else {
            // If the user has not liked the post, add the like
            const like = await PostLike.create({ user: userId, post: postId });
            await Post.findByIdAndUpdate(postId, { $addToSet: { likedBy: userId } });
            res.status(200).json({ message: 'Post liked successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.get_comment = async (req, res, next) => {
    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    const postId = req.params.postId;

    try {
        // Find all comments for the post
        const comments = await Comment.find({ post: postId }).populate('user').exec();

        // Function to recursively retrieve nested comments
        const getNestedComments = (comments, parentCommentId) => {
            const nestedComments = [];
            for (const comment of comments) {
                if (comment.parentComment && comment.parentComment.toString() === parentCommentId.toString()) {
                    nestedComments.push({
                        ...comment.toObject(),
                        replies: getNestedComments(comments, comment._id)
                    });
                }
            }
            return nestedComments;
        };

        // Get top-level comments (comments without parentComment)
        const topLevelComments = comments.filter(comment => !comment.parentComment);

        // Generate a tree structure with nested comments
        const commentsTree = topLevelComments.map(comment => ({
            ...comment.toObject(),
            replies: getNestedComments(comments, comment._id)
        }));

        res.status(200).json(commentsTree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Express route for adding a comment to a post
exports.add_comment = async (req, res, next) => {


    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    const postId = req.body.postId;
    const commentText = req.body.comment;


    const parentCommentId = req.body.parentCommentId; // If provided, it's a reply to another comment

    try {
        // Create a new comment document
        const commentData = {
            user: userId,
            post: postId,
            text: commentText,
            createdAt: Date.now()
        };

        if (parentCommentId) {
            commentData.parentComment = parentCommentId;
        }

        console.log("commentData=====>", commentData);


        // Create a new comment document
        const comment = await Comment.create(commentData);

        console.log("comment=>", comment);

        // Update the totalComment field in the corresponding Post document
        await Post.findByIdAndUpdate(postId, { $addToSet: { commentedBy: postId } });

        res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.get_circle_post = async (req, res, next) => {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    try {
        // Find the circle document associated with the user
        const user = await Users.findById(userId).select('circle').lean();
        const circle = user.circle || [];
        // Find all posts created by users within the circle
        const posts = await Post.find({ createdBy: { $in: circle } }).sort({ createdAt: -1 }).populate('createdBy');
        if (posts.length <= 5) return this.get_all_post(req, res, next)
        res.status(200).json({ posts: posts });
    } catch (error) {
        console.error('Error fetching posts from circle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



