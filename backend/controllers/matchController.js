const User = require('../models/User');
const Match = require('../models/Match');

// Simple matching algorithm based on common subjects and time slots
const findMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all other users
    const allUsers = await User.find({ _id: { $ne: userId } });
    
    // Calculate compatibility scores
    const matches = allUsers.map(user => {
      // Calculate common subjects
      const commonSubjects = currentUser.subjects.filter(subject => 
        user.subjects.includes(subject)
      );
      
      // Calculate common time slots
      const commonTimeSlots = currentUser.timeSlots.filter(slot => 
        user.timeSlots.includes(slot)
      );
      
      // Calculate compatibility score
      // Weighted scoring: 60% for subjects, 40% for time slots
      const subjectScore = (commonSubjects.length / Math.max(currentUser.subjects.length, user.subjects.length)) * 60;
      const timeSlotScore = (commonTimeSlots.length / Math.max(currentUser.timeSlots.length, user.timeSlots.length)) * 40;
      const compatibilityScore = Math.round(subjectScore + timeSlotScore);
      
      return {
        user,
        commonSubjects,
        commonTimeSlots,
        compatibilityScore
      };
    });
    
    // Sort by compatibility score (descending)
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // Return top 10 matches
    res.json(matches.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error: error.message });
  }
};

// Get matches for a user
const getMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    const matches = await Match.find({ 
      $or: [{ user1: userId }, { user2: userId }] 
    }).populate('user1 user2');
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
};

module.exports = {
  findMatches,
  getMatches
};