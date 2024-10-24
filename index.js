const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const task = require('./api/task/task');
const user = require('./api/users/user');
const post = require('./api/post/post');
const chat = require('./api/chat/chat');
const conversation = require('./api/controller/chat')
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const port = 3000;

mongoose.connect(`mongodb+srv://node-task:${process.env.MONGO_PASSWORD}@cluster0.qgzvhs7.mongodb.net`);

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

app.use('/uploads', express.static('uploads'));
app.use('/postimage', express.static('postimage'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.sendStatus(200).json({});
    }
    next();
});

app.use('/task', task);
app.use('/users', user);
app.use('/post', post);
app.use('/chat', chat);


app.use((req, res, next) => {
    const error = new Error('Not found');
    error['status'] = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: { errorMes: error.message }
    });
});

const server = http.createServer(app); // Create HTTP server
const io = socketIO(server); // Initialize Socket.IO with HTTP server
global.onlineUsers = new Map();

io.on("connection", (socket) => {
    
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    
    onlineUsers.set(userId, socket.id);
  });

  socket.on("chat_message", (data) => {
    
    const sendUserSocket = onlineUsers.get(data.from);
    
    
    if (sendUserSocket) {
      conversation.saveMessage(data).then((conversationData) => {
        console.log("conversationData=>",conversationData);
      io.to(sendUserSocket).emit("msg-recieve", { from: data.from,to:data.to, msg: data.msg });
      console.log(`Message sent to user ${data.to}`);
    })
      // If the recipient is online, emit the message to them
      
    } else {
      console.log(`User ${data.to} is not online.`);
      // Handle the case where the recipient is not online
      // You may want to store the message in the database for later retrieval
    }
  });
});



server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
