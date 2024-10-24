const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth')
const chatController = require('../controller/chat')
// API endpoint to send a message
router.get('/getUserChat/:userId',checkAuth, chatController.getUserConversation);
router.get('/:userId',checkAuth, chatController.getUserAllConversations);
module.exports = router;