const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    // Check if sender and receiver are the same user
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
    
    // Check if users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if they are already friends
    if (sender.friends.includes(receiverId) || receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: 'Users are already friends' });
    }
    
    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    
    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId
    });
    
    const savedRequest = await friendRequest.save();
    
    // Populate sender and receiver details
    await savedRequest.populate('sender receiver', 'name');
    
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
};

// Get friend requests for a user
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const requests = await FriendRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).populate('sender receiver', 'name');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend requests', error: error.message });
  }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }
    
    // Update request status
    friendRequest.status = 'accepted';
    const updatedRequest = await friendRequest.save();
    
    // Add users to each other's friends list
    const sender = await User.findById(friendRequest.sender);
    const receiver = await User.findById(friendRequest.receiver);
    
    if (!sender.friends.includes(friendRequest.receiver)) {
      sender.friends.push(friendRequest.receiver);
      await sender.save();
    }
    
    if (!receiver.friends.includes(friendRequest.sender)) {
      receiver.friends.push(friendRequest.sender);
      await receiver.save();
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error: error.message });
  }
};

// Reject a friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the friend request
    const friendRequest = await FriendRequest.findByIdAndUpdate(
      requestId,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    res.json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
};

// Get friends list for a user
const getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId).populate('friends', 'name subjects studyStyle timeSlots academicGoal');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends', error: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends
};