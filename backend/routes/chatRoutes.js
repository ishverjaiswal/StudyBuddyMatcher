const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/chatController');

// Send a new message
router.post('/send', sendMessage);

// Get messages between two users
router.get('/:userId1/:userId2', getMessages);

// Mark a message as read
router.put('/read/:messageId', markAsRead);

module.exports = router;