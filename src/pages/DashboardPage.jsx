import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findMatches } from '../services/api';
import { sendFriendRequest } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [studyBuddies, setStudyBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({}); // Track request status for each buddy
  
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const matches = await findMatches(user._id || user.id);
        
        // Transform the matches data to match our component structure
        const transformedMatches = matches.map((match, index) => ({
          id: match.user._id || match.user.id,
          name: match.user.name,
          subjects: match.user.subjects || [],
          studyStyle: match.user.studyStyle || '',
          availability: match.user.timeSlots || [],
          goal: match.user.academicGoal || '',
          mutualSubjects: match.commonSubjects ? match.commonSubjects.length : 0,
          compatibilityScore: match.compatibilityScore || 0
        }));
        
        setStudyBuddies(transformedMatches);
        setError(null);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load study buddies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Finding your study buddies...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please log in to view your dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to see study buddy recommendations</p>
        </div>
      </div>
    );
  }
  
  const handleConnect = async (buddyId) => {
    try {
      // Set request status to loading
      setRequestStatus(prev => ({ ...prev, [buddyId]: 'sending' }));
      
      // Send friend request
      const response = await sendFriendRequest(user._id || user.id, buddyId);
      
      // Check if response has an error message
      if (response.message) {
        // Error occurred
        console.error('Friend request error:', response.message);
        setRequestStatus(prev => ({ ...prev, [buddyId]: 'error' }));
        // Show error message to user
        setError(response.message);
        setTimeout(() => {
          setRequestStatus(prev => ({ ...prev, [buddyId]: null }));
          setError(null);
        }, 3000);
      } else if (response._id) {
        // Request sent successfully
        setRequestStatus(prev => ({ ...prev, [buddyId]: 'sent' }));
        
        // Show success message
        setTimeout(() => {
          setRequestStatus(prev => ({ ...prev, [buddyId]: null }));
        }, 3000);
      } else {
        // Unexpected response
        console.error('Unexpected response:', response);
        setRequestStatus(prev => ({ ...prev, [buddyId]: 'error' }));
        setError('Unexpected error occurred');
        setTimeout(() => {
          setRequestStatus(prev => ({ ...prev, [buddyId]: null }));
          setError(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending request:', err);
      setRequestStatus(prev => ({ ...prev, [buddyId]: 'error' }));
      setError('Network error occurred');
      setTimeout(() => {
        setRequestStatus(prev => ({ ...prev, [buddyId]: null }));
        setError(null);
      }, 3000);
    }
  };
  
  // Sort buddies by compatibility score for top matches
  const topMatches = [...studyBuddies]
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
    .slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Error display for friend requests */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Study Buddies</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect study partner based on shared subjects and availability
          </p>
        </div>
        
        {/* Top Suggestions */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Top Matches</h2>
            <button 
              onClick={() => navigate('/friends')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Friends
            </button>
          </div>
          
          {topMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topMatches.map((buddy) => (
                <div key={buddy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{buddy.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {buddy.mutualSubjects} mutual subjects
                          </span>
                        </div>
                      </div>
                      <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2 py-1 rounded">
                        Top Match
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buddy.subjects.slice(0, 3).map((subject, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                            >
                              {subject}
                            </span>
                          ))}
                          {buddy.subjects.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                              +{buddy.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Style</h4>
                        <p className="text-gray-800 dark:text-gray-200">{buddy.studyStyle}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buddy.availability.slice(0, 2).map((slot, index) => (
                            <span 
                              key={index} 
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal</h4>
                        <p className="text-gray-800 dark:text-gray-200">{buddy.goal}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect(buddy.id)}
                      disabled={requestStatus[buddy.id] === 'sending'}
                      className={`w-full font-medium py-2 px-4 rounded-lg transition duration-300 ${
                        requestStatus[buddy.id] === 'sending'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : requestStatus[buddy.id] === 'sent'
                          ? 'bg-green-600 text-white'
                          : requestStatus[buddy.id] === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {requestStatus[buddy.id] === 'sending'
                        ? 'Sending...'
                        : requestStatus[buddy.id] === 'sent'
                        ? 'Request Sent'
                        : requestStatus[buddy.id] === 'error'
                        ? 'Error - Try Again'
                        : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No matches found yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't find any study buddies matching your preferences. Try updating your profile to include more subjects or time slots.</p>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
        
        {/* All Buddies */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">All Study Buddies</h2>
          
          {studyBuddies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyBuddies.map((buddy) => (
                <div key={buddy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{buddy.name}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {buddy.mutualSubjects}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buddy.subjects.slice(0, 2).map((subject, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                            >
                              {subject}
                            </span>
                          ))}
                          {buddy.subjects.length > 2 && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                              +{buddy.subjects.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Style</h4>
                        <p className="text-gray-800 dark:text-gray-200">{buddy.studyStyle}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buddy.availability.slice(0, 2).map((slot, index) => (
                            <span 
                              key={index} 
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect(buddy.id)}
                      disabled={requestStatus[buddy.id] === 'sending'}
                      className={`w-full font-medium py-2 px-4 rounded-lg transition duration-300 ${
                        requestStatus[buddy.id] === 'sending'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : requestStatus[buddy.id] === 'sent'
                          ? 'bg-green-600 text-white'
                          : requestStatus[buddy.id] === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {requestStatus[buddy.id] === 'sending'
                        ? 'Sending...'
                        : requestStatus[buddy.id] === 'sent'
                        ? 'Request Sent'
                        : requestStatus[buddy.id] === 'error'
                        ? 'Error - Try Again'
                        : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No study buddies found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't find any study buddies matching your preferences. Try updating your profile to include more subjects or time slots.</p>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;