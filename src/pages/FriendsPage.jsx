import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends } from '../services/api';

const FriendsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch friend requests
        const requests = await getFriendRequests(user._id || user.id);
        setFriendRequests(requests);
        
        // Fetch friends
        const friendsList = await getFriends(user._id || user.id);
        setFriends(friendsList);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      
      // Update the UI
      setFriendRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'accepted' } : req
      ));
      
      // Refresh friends list
      const friendsList = await getFriends(user._id || user.id);
      setFriends(friendsList);
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept request. Please try again.');
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      
      // Update the UI
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request. Please try again.');
    }
  };
  
  const handleChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please log in to view your friends</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to see your friends and requests</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Friends</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your friend requests and chat with your study buddies
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Friend Requests
              {friendRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-0.5 rounded-full">
                  {friendRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'friends'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Friends
            </button>
          </nav>
        </div>
        
        {/* Friend Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {friendRequests.filter(req => req.status === 'pending').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendRequests
                  .filter(req => req.status === 'pending')
                  .map((request) => (
                    <div key={request._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-indigo-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                            {request.sender._id === (user._id || user.id) 
                              ? request.receiver.name.charAt(0) 
                              : request.sender.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                              {request.sender._id === (user._id || user.id) 
                                ? request.receiver.name 
                                : request.sender.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.sender._id === (user._id || user.id) 
                                ? 'Request sent' 
                                : 'Sent you a request'}
                            </p>
                          </div>
                        </div>
                        
                        {request.sender._id !== (user._id || user.id) && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No pending requests</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any pending friend requests right now.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => (
                  <div key={friend._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-indigo-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                          {friend.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {friend.name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {friend.subjects?.slice(0, 3).map((subject, index) => (
                              <span 
                                key={index} 
                                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                              >
                                {subject}
                              </span>
                            ))}
                            {friend.subjects?.length > 3 && (
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                                +{friend.subjects.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Style</h4>
                          <p className="text-gray-800 dark:text-gray-200">{friend.studyStyle || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleChat(friend._id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No friends yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any friends yet. Send friend requests to connect with other users.
                </p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Find Study Buddies
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;