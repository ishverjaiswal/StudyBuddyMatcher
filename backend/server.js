const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Models
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  
  // Start server only after MongoDB connection is established
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit if we can't connect to the database
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Register user
  socket.on('register_user', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });
  
  // Join a chat room
  socket.on('join_room', (data) => {
    socket.join(data.room);
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
    
    // Notify other user that someone joined
    socket.to(data.room).emit("user_joined", { userId: data.userId });
  });
  
  // Send message to a chat room
  socket.on('send_message', async (data) => {
    console.log('Message received:', data);
    
    // Save message to database
    try {
      const message = new Message({
        sender: data.senderId,
        content: data.message,
        messageType: data.messageType || 'text',
        imageUrl: data.imageUrl || null,
        // In a real app, you might want to store the room or receiver info
      });
      
      await message.save();
      
      // Broadcast message to room with message ID
      socket.to(data.room).emit("receive_message", {
        messageId: message._id,
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date(),
        messageType: data.messageType || 'text',
        imageUrl: data.imageUrl || null
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.room).emit("user_typing", { userId: data.userId, isTyping: data.isTyping });
  });
  
  // Handle message read receipts
  socket.on('messages_read', (data) => {
    socket.to(data.room).emit("message_read", { userId: data.userId });
  });
  
  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'StudyBuddy API is running!' });
});

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Matching routes
app.use('/api/match', require('./routes/matchRoutes'));

// Chat routes
app.use('/api/chat', require('./routes/chatRoutes'));

// Friend routes
app.use('/api/friends', require('./routes/friendRoutes'));

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please close the other application or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
});