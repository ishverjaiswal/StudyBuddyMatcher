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