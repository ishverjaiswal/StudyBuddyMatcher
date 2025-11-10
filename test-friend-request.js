// Test script for friend request functionality
const API_BASE_URL = 'http://localhost:5000/api';

// Example user IDs (replace with actual user IDs from your database)
const USER_ID = '690f3666cc2cd15e3b0cf6b8'; // Replace with actual user ID

// Function to send a friend request (this will fail since we're sending to ourselves)
async function sendFriendRequestToSelf() {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId: USER_ID,
        receiverId: USER_ID // Sending to ourselves
      }),
    });
    
    const data = await response.json();
    console.log('Friend request to self result:', data);
    return data;
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
}

// Function to get friend requests for a user
async function getFriendRequests(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/requests/${userId}`);
    const data = await response.json();
    console.log('Friend requests:', data);
    return data;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
  }
}

// Function to get friends list
async function getFriends(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/friends/${userId}`);
    const data = await response.json();
    console.log('Friends list:', data);
    return data;
  } catch (error) {
    console.error('Error fetching friends:', error);
  }
}

// Test the functionality
async function testFriendRequestFlow() {
  console.log('Testing friend request flow...');
  
  // 1. Try to send a friend request to ourselves (should fail)
  console.log('\n1. Trying to send friend request to self...');
  await sendFriendRequestToSelf();
  
  // 2. Get friend requests for the user
  console.log('\n2. Getting friend requests for user...');
  await getFriendRequests(USER_ID);
  
  // 3. Check friends list
  console.log('\n3. Getting friends list...');
  await getFriends(USER_ID);
}

// Run the test
testFriendRequestFlow();