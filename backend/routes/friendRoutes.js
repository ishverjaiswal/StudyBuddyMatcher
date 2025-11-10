const express = require('express');
const router = express.Router();
const { 
  sendFriendRequest, 
  getFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  getFriends
} = require('../controllers/friendController');

// Send a friend request
router.post('/request', sendFriendRequest);

// Get friend requests for a user
router.get('/requests/:userId', getFriendRequests);

// Accept a friend request
router.put('/accept/:requestId', acceptFriendRequest);

// Reject a friend request
router.put('/reject/:requestId', rejectFriendRequest);

// Get friends list for a user
router.get('/friends/:userId', getFriends);

module.exports = router;