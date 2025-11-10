const API_BASE_URL = 'http://localhost:5000/api';

// User API calls
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  return response.json();
};

// Matching API calls
export const findMatches = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/match/find/${userId}`);
  return response.json();
};

// Chat API calls
export const sendMessage = async (messageData) => {
  const response = await fetch(`${API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });
  
  return response.json();
};

export const getMessages = async (userId1, userId2) => {
  const response = await fetch(`${API_BASE_URL}/chat/${userId1}/${userId2}`);
  return response.json();
};

export const markAllAsRead = async (userId1, userId2) => {
  const response = await fetch(`${API_BASE_URL}/chat/read-all/${userId1}/${userId2}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

// Friend API calls
export const sendFriendRequest = async (senderId, receiverId) => {
  const response = await fetch(`${API_BASE_URL}/friends/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ senderId, receiverId }),
  });
  
  return response.json();
};

export const getFriendRequests = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/friends/requests/${userId}`);
  return response.json();
};

export const acceptFriendRequest = async (requestId) => {
  const response = await fetch(`${API_BASE_URL}/friends/accept/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

export const rejectFriendRequest = async (requestId) => {
  const response = await fetch(`${API_BASE_URL}/friends/reject/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

export const getFriends = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/friends/friends/${userId}`);
  return response.json();
};