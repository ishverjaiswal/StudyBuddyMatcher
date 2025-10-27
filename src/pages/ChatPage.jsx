import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const { buddyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize Socket.io
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Mock data for the chat buddy
  const chatBuddy = {
    id: buddyId,
    name: "Alex Johnson",
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
  
  // Initialize socket connection
  useEffect(() => {
    if (!user) return;
    
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
          id: Date.now(),
          sender: "buddy",
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });
    
    // Listen for typing indicators
    newSocket.on("user_typing", (data) => {
      setIsBuddyTyping(data.isTyping);
    });
    
    // Listen for user join
    newSocket.on("user_joined", (data) => {
      console.log(`User ${data.userId} joined the chat`);
    });
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, buddyId]);
  
  // Fetch existing messages
  useEffect(() => {
    if (!user) return;
    
    // In a real app, you would fetch existing messages from the API
    // For now, we'll use mock data
    const mockMessages = [
      {
        id: 1,
        sender: "buddy",
        text: "Hi there! I saw we have Data Structures in common. Are you preparing for the midterm?",
        timestamp: "10:30 AM"
      },
      {
        id: 2,
        sender: "me",
        text: "Yes, exactly! I'm struggling with binary trees. Do you have any resources to recommend?",
        timestamp: "10:32 AM"
      },
      {
        id: 3,
        sender: "buddy",
        text: "Sure! I found this great visualization tool for binary trees. Would you like me to send you the link?",
        timestamp: "10:33 AM"
      }
    ];
    
    setMessages(mockMessages);
  }, [user, buddyId]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !socket || !user) return;
    
    // Add message to UI immediately
    const messageData = {
      id: Date.now(),
      sender: "me",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prevMessages) => [...prevMessages, messageData]);
    
    // Send message through socket
    const roomId = `chat_${[user._id || user.id, buddyId].sort().join('_')}`;
    socket.emit("send_message", {
      senderId: user._id || user.id,
      message: newMessage,
      room: roomId
    });
    
    setNewMessage("");
    
    // Stop typing indicator
    socket.emit("typing", { room: roomId, userId: user._id || user.id, isTyping: false });
  };
  
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
                <p>{message.text}</p>
                <p 
                  className={`text-xs mt-1 ${
                    message.sender === 'me' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp}
                </p>
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
      
      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex">
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
            disabled={!newMessage.trim()}
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