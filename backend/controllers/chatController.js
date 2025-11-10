const Message = require('../models/Message');

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content, messageType, imageUrl } = req.body;
    
    const message = new Message({
      sender,
      receiver,
      content,
      messageType: messageType || 'text',
      imageUrl: imageUrl || null
    });
    
    const savedMessage = await message.save();
    
    // Populate sender and receiver details
    await savedMessage.populate('sender receiver', 'name');
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).populate('sender receiver', 'name');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};

// Mark all messages as read between two users
const markAllAsRead = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const result = await Message.updateMany(
      { 
        sender: userId2, 
        receiver: userId1,
        read: false
      },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  markAllAsRead
};