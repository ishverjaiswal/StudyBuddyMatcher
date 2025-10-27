import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subjects: user?.subjects || [],
    studyStyle: user?.studyStyle || '',
    timeSlots: user?.timeSlots || [],
    academicGoal: user?.academicGoal || '',
    profilePicture: ''
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMultiSelectChange = (e, field) => {
    const { value, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };
  
  const handleSave = () => {
    // In a real app, you would send this data to your backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to access this page</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="bg-indigo-600 text-white font-bold text-5xl w-32 h-32 rounded-full flex items-center justify-center mb-4">
                  {user.name.charAt(0)}
                </div>
                {isEditing && (
                  <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Upload new picture
                  </button>
                )}
              </div>
              
              {/* Profile Details */}
              <div className="md:w-2/3">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
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
                              checked={profileData.subjects.includes(subject)}
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
                    
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="studyStyle">
                        Preferred Study Style
                      </label>
                      <select
                        id="studyStyle"
                        name="studyStyle"
                        value={profileData.studyStyle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select your preferred study style</option>
                        {studyStyles.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                    
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
                              checked={profileData.timeSlots.includes(slot)}
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
                    
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="academicGoal">
                        Academic Goal
                      </label>
                      <select
                        id="academicGoal"
                        name="academicGoal"
                        value={profileData.academicGoal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select your academic goal</option>
                        {academicGoals.map((goal) => (
                          <option key={goal} value={goal}>{goal}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Study Preferences</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user.subjects.map((subject, index) => (
                              <span 
                                key={index} 
                                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Style</h4>
                          <p className="text-gray-800 dark:text-gray-200">{user.studyStyle}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Time Slots</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user.timeSlots.map((slot, index) => (
                              <span 
                                key={index} 
                                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Goal</h4>
                          <p className="text-gray-800 dark:text-gray-200">{user.academicGoal}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;