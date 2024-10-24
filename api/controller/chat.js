const mongoose = require('mongoose');
const Conversation = require('../models/chat')
var jwt = require('jsonwebtoken');
// API endpoint to get all messages
exports.getMessage = async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });
    if (conversation) {
      res.json(conversation.messages);
    } else {
      res.status(404).send('Conversation not found');
    }
  } catch (err) {
    res.status(500).send('Error retrieving messages');
  }
}








// Function to save a message in a conversation or create a new conversation if needed
exports.saveMessage = async (messageData) => {
  try {
    // Identify participants
    const participants = [messageData.from, messageData.to];

    // Find or create the conversation
    let conversation = await Conversation.findOne({ participants: { $all: participants } }).exec();
    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation = new Conversation({ participants }); // Ensure Conversation schema has _id field
      await conversation.save();
    }
    // Add the message to the conversation
    conversation.messages.push(messageData);
    await conversation.save();
    return conversation; // Return the conversation object
  } catch (error) {
    console.error('Error saving message:', error);
    throw error; // Handle or propagate the error as needed
  }
}


// Function to find conversations where the user's ID is included as a participant and return only the latest message for each conversation
exports.getUserAllConversations = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    // Aggregate to find conversations and retrieve only the latest message from each conversation
    const conversations = await Conversation.aggregate([
      // Match conversations where the user's ID is included as a participant
      { $match: { participants: userId } },
      // Unwind the messages array
      { $unwind: "$messages" },
      // Sort messages within each conversation by timestamp in descending order
      { $sort: { "messages.timestamp": -1 } },
      // Group by conversation ID and retrieve only the first message (latest) in each group
      {
        $group: {
          _id: "$_id",
          messages: { $first: "$messages" },
          participants: { $first: "$participants" }
        }
      }
    ]);

    return res.status(200).json({ data: conversations });
  } catch (error) {
    console.error('Error finding conversations:', error);
    return res.status(500).json({ error: error.message });
  }
}


// Function to find conversations where the user's ID is included as a participant
exports.getUserConversation = async (req, res, next) => {
  const conversationId = req.params.userId
  try {
    // Find conversations where the user's ID is included as a participant
    const conversations = await Conversation.findOne({ _id: conversationId }).exec();
    return res.status(200).json({ data: conversations });
  } catch (error) {
    console.error('Error finding conversations:', error);
    return res.status(500).json({ error: error.message })
  }
}



exports.sendMessage = async (req, res) => {
  const { sender, receiver, message } = req.body;
  try {
    let conversation = await Conversation.findOneAndUpdate(
      { participants: { $all: [sender, receiver] } },
      { $push: { messages: { sender, receiver, message } } },
      { upsert: true, new: true }
    );
    res.status(201).json(conversation.messages);
  } catch (err) {
    res.status(500).send('Error sending message');
  }
}




