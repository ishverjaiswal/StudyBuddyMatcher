// Cleanup and test script for friend request functionality
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the FriendRequest model
const FriendRequest = require('./backend/models/FriendRequest');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/studybuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to clean up friend requests
async function cleanupFriendRequests() {
  try {
    await FriendRequest.deleteMany({});
    console.log('All friend requests deleted');
  } catch (error) {
    console.error('Error cleaning up friend requests:', error);
  }
}

// Run cleanup
cleanupFriendRequests().then(() => {
  mongoose.connection.close();
  console.log('Database connection closed');
});