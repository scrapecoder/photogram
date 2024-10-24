const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const Task = require('../models/task-schema');

exports.add_task = (req, res, next) => {
    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId; // Assuming user ID is stored in the token payload as 'userId'
    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description,
        taskImage:req.file.path,
        userId:userId
    });
    task.save()
        .then(result => {
            res.status(200).json({ 
                message: "Task created",
                createTask: task
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.get_all_task = (req, res, next) => {
    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId; // Assuming user ID is stored in the token payload as 'userId'
    Task.find({userId:userId}).exec()
        .then(data => {

            res.status(200).json(data); // Changed to res.status(200).json(data)
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.get_task_by_id =(req, res, next) => {
    const id = req.params.taskId;
    Task.findById(id).exec()
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

exports.delete_task = (req, res, next) => {
    const id = req.params.taskId;
    Task.deleteOne({ _id: id }).exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: "Something went wrong" });
        });
}

exports.update_task = (req, res, next) => {
    const id = req.params.taskId;
    const updateObj = {};
    const body = req.body
    if(req.file.path){
        updateObj['taskImage'] = req.file.path
    }
    for (const obj in body) {
        updateObj[obj] = body[obj]
    }
    
    Task.findOneAndUpdate({ _id: id }, { $set: updateObj }).exec().then((doc) => {
        res.status(200).json(doc)
    }).catch(err => {
        res.status(500).json({ error: "Something went wrong" });
    });
}