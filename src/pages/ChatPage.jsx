import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, markAllAsRead } from '../services/api';
import { getFriends } from '../services/api';

const ChatPage = () => {
  const { buddyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize Socket.io
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState({});
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Mock data for the chat buddy
  const chatBuddy = {
    id: buddyId,
    name: "Study Buddy",
    subjects: ["Mathematics", "Physics", "Data Structures"],
    studyStyle: "Video calls",
    availability: ["Morning", "Evening"],
    goal: "Exam preparation"
  };
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if users are friends
  useEffect(() => {
    if (!user) return;
    
    const checkFriendship = async () => {
      try {
        const friends = await getFriends(user._id || user.id);
        const isUserFriend = friends.some(friend => friend._id === buddyId);
        setIsFriend(isUserFriend);
        setLoading(false);
      } catch (error) {
        console.error("Error checking friendship:", error);
        setLoading(false);
      }
    };
    
    checkFriendship();
  }, [user, buddyId]);
  
  // Initialize socket connection
  useEffect(() => {
    if (!user || !isFriend) return;
    
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    
    // Register user
    newSocket.emit("register_user", user._id || user.id);
    
    // Join chat room (using a consistent room name for both users)
    const roomId = `chat_${[user._id || user.id, buddyId].sort().join('_')}`;
    newSocket.emit("join_room", { room: roomId, userId: user._id || user.id });
    
    // Listen for incoming messages
    newSocket.on("receive_message", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.messageId || Date.now(),
          sender: "buddy",
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          messageType: data.messageType || 'text',
          imageUrl: data.imageUrl || null
        }
      ]);
    });
    
    // Listen for typing indicators
    newSocket.on("user_typing", (data) => {
      setIsBuddyTyping(data.isTyping);
    });
    
    // Listen for message read receipts
    newSocket.on("message_read", (data) => {
      setReadReceipts(prev => ({
        ...prev,
        [data.messageId]: true
      }));
    });
    
    // Listen for user join
    newSocket.on("user_joined", (data) => {
      console.log(`User ${data.userId} joined the chat`);
    });
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, buddyId, isFriend]);
  
  // Fetch existing messages and mark them as read
  useEffect(() => {
    if (!user || !isFriend) return;
    
    const fetchAndMarkMessages = async () => {
      try {
        // Fetch existing messages
        const fetchedMessages = await getMessages(user._id || user.id, buddyId);
        
        // Transform messages to match our format
        const formattedMessages = fetchedMessages.map(msg => ({
          id: msg._id,
          sender: msg.sender._id === (user._id || user.id) ? "me" : "buddy",
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: msg.read,
          messageType: msg.messageType || 'text',
          imageUrl: msg.imageUrl || null
        }));
        
        setMessages(formattedMessages);
        
        // Mark all messages as read
        await markAllAsRead(user._id || user.id, buddyId);
        
        // Emit read receipt to the other user
        if (socket) {
          const roomId = `chat_${[user._id || user.id, buddyId].sort().join('_')}`;
          socket.emit("messages_read", { room: roomId, userId: user._id || user.id });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Fallback to mock data if API fails
        const mockMessages = [
          {
            id: 1,
            sender: "buddy",
            text: "Hi there! I saw we have Data Structures in common. Are you preparing for the midterm?",
            timestamp: "10:30 AM",
            read: true,
            messageType: 'text'
          },
          {
            id: 2,
            sender: "me",
            text: "Yes, exactly! I'm struggling with binary trees. Do you have any resources to recommend?",
            timestamp: "10:32 AM",
            read: true,
            messageType: 'text'
          },
          {
            id: 3,
            sender: "buddy",
            text: "Sure! I found this great visualization tool for binary trees. Would you like me to send you the link?",
            timestamp: "10:33 AM",
            read: true,
            messageType: 'text'
          }
        ];
        setMessages(mockMessages);
      }
    };
    
    fetchAndMarkMessages();
  }, [user, buddyId, socket, isFriend]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((newMessage.trim() === "" && !fileInputRef.current?.files[0]) || !socket || !user) return;
    
    let content = newMessage;
    let messageType = 'text';
    let imageUrl = null;
    
    // Handle image upload
    if (fileInputRef.current?.files[0]) {
      const file = fileInputRef.current.files[0];
      if (file.type.startsWith('image/')) {
        // In a real app, you would upload the image to a storage service
        // For demo purposes, we'll just simulate this
        try {
          imageUrl = URL.createObjectURL(file);
          content = "Sent an image";
          messageType = 'image';
        } catch (error) {
          console.error("Error processing image:", error);
          alert("Error processing image. Please try another file.");
          return;
        }
      } else {
        alert("Please select an image file (JPEG, PNG, etc.)");
        return;
      }
    }
    
    // Add message to UI immediately
    const messageData = {
      id: Date.now(),
      sender: "me",
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      messageType,
      imageUrl
    };
    
    setMessages((prevMessages) => [...prevMessages, messageData]);
    
    // Send message through socket
    const roomId = `chat_${[user._id || user.id, buddyId].sort().join('_')}`;
    socket.emit("send_message", {
      senderId: user._id || user.id,
      message: content,
      room: roomId,
      messageType,
      imageUrl
    });
    
    setNewMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Stop typing indicator
    socket.emit("typing", { room: roomId, userId: user._id || user.id, isTyping: false });
  };
  
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };
  
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Simple emoji picker options
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '💡'];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }
  
  if (!isFriend) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Not Connected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be friends with this user to chat with them.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Send them a friend request from the dashboard to connect.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Find Buddies
            </button>
            <button 
              onClick={() => navigate('/friends')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              View Requests
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ←
            </button>
            <div className="relative">
              <div className="bg-indigo-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                {chatBuddy.name.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="ml-3">
              <h2 className="font-bold text-gray-800 dark:text-white">{chatBuddy.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              📞
            </button>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ⋮
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                }`}
              >
                {message.messageType === 'image' && message.imageUrl ? (
                  <div>
                    <img 
                      src={message.imageUrl} 
                      alt="Uploaded content" 
                      className="max-w-full max-h-48 rounded-lg mb-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23666'%3EImage%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    {message.text && <p>{message.text}</p>}
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
                <div className={`flex justify-end items-center mt-1`}>
                  <span 
                    className={`text-xs ${
                      message.sender === 'me' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp}
                  </span>
                  {message.sender === 'me' && (
                    <span className="ml-1 text-xs text-indigo-200">
                      {readReceipts[message.id] || message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isBuddyTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg rounded-bl-none">
                <p className="text-sm text-gray-500 dark:text-gray-400">Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Emoji Picker */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-1">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiSelect(emoji)}
              className="text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      
      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex">
          <button
            type="button"
            onClick={handleImageUpload}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                // File will be sent when the form is submitted
              }
            }}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              // Send typing indicator
              if (socket && user) {
                const roomId = `chat_${[user._id || user.id, buddyId].sort().join('_')}`;
                socket.emit("typing", { room: roomId, userId: user._id || user.id, isTyping: true });
                
                // Stop typing indicator after 1 second of inactivity
                setTimeout(() => {
                  socket.emit("typing", { room: roomId, userId: user._id || user.id, isTyping: false });
                }, 1000);
              }
            }}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && !fileInputRef.current?.files[0]}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-r-lg font-medium transition duration-300 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;