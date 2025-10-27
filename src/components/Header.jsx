import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleSignOut = () => {
    logout();
    navigate('/');
  };
  
  const handleToggleDarkMode = () => {
    toggleDarkMode();
    // Save preference to localStorage
    const newTheme = darkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center">
            S
          </div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">StudyBuddy</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
            Home
          </Link>
          <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
            Dashboard
          </Link>
          {user && (
            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
              Profile
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleToggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {user ? (
            <button 
              onClick={handleSignOut}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;