import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex flex-col">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl">
          {/* Logo and Name */}
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 text-white font-bold text-4xl w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
              S
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-indigo-800 dark:text-indigo-400 mb-4">
            StudyBuddy
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10">
            Find your perfect study partner!
          </p>
          
          {/* Get Started Button */}
          <button 
            onClick={handleGetStarted}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105"
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          
          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="text-indigo-600 dark:text-indigo-400 text-3xl mb-3">📚</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Smart Matching</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with partners who share your subjects and study goals
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="text-indigo-600 dark:text-indigo-400 text-3xl mb-3">💬</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Real-time Chat</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Communicate instantly with your study partners
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="text-indigo-600 dark:text-indigo-400 text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Achieve Goals</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay motivated and reach your academic objectives together
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 dark:text-gray-400">
        <p>© 2025 StudyBuddy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;