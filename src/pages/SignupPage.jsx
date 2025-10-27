import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjects: [],
    studyStyle: '',
    timeSlots: [],
    academicGoal: ''
  });
  
  const subjectsOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English Literature', 'History', 'Geography', 'Economics', 'Psychology',
    'Data Structures', 'Algorithms', 'Machine Learning', 'Web Development',
    'Mobile Development', 'Database Systems'
  ];
  
  const studyStyles = [
    'Text-based', 'Video calls', 'Group study', 'Silent study', 'Discussion forums'
  ];
  
  const timeSlotsOptions = [
    'Morning (6AM-10AM)', 'Late Morning (10AM-2PM)', 'Afternoon (2PM-6PM)',
    'Evening (6PM-10PM)', 'Night (10PM-2AM)'
  ];
  
  const academicGoals = [
    'Exam preparation', 'Project work', 'Learning new skills', 
    'Research assistance', 'Homework help'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMultiSelectChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      // Handle password mismatch
      console.log('Passwords do not match');
      return;
    }
    
    // Here we would typically send the data to your backend
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      subjects: formData.subjects,
      studyStyle: formData.studyStyle,
      timeSlots: formData.timeSlots,
      academicGoal: formData.academicGoal
    };
    
    const result = await signup(userData);
    
    if (result.success) {
      // Navigate to dashboard after successful signup
      navigate('/dashboard');
    } else {
      console.log('Signup failed:', result.error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Create Account</h1>
              <p className="text-gray-600 dark:text-gray-300">Join StudyBuddy to find your perfect study partner</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Study Preferences */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Study Preferences</h2>
                <div className="space-y-4">
                  {/* Subjects */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Subjects you want to study
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjectsOptions.map((subject) => (
                        <div key={subject} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`subject-${subject}`}
                            value={subject}
                            onChange={(e) => handleMultiSelectChange(e, 'subjects')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`subject-${subject}`} 
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            {subject}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Study Style */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="studyStyle">
                      Preferred Study Style
                    </label>
                    <select
                      id="studyStyle"
                      name="studyStyle"
                      value={formData.studyStyle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select your preferred study style</option>
                      {studyStyles.map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Slots */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlotsOptions.map((slot) => (
                        <div key={slot} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`slot-${slot}`}
                            value={slot}
                            onChange={(e) => handleMultiSelectChange(e, 'timeSlots')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`slot-${slot}`} 
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            {slot}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Academic Goal */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="academicGoal">
                      Academic Goal
                    </label>
                    <select
                      id="academicGoal"
                      name="academicGoal"
                      value={formData.academicGoal}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select your academic goal</option>
                      {academicGoals.map((goal) => (
                        <option key={goal} value={goal}>{goal}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
                {error && (
                  <p className="text-red-500 text-center mt-2">{error}</p>
                )}
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;