const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  subjects: [{
    type: String
  }],
  studyStyle: {
    type: String,
    enum: ['Text-based', 'Video calls', 'Group study', 'Silent study', 'Discussion forums']
  },
  timeSlots: [{
    type: String,
    enum: ['Morning (6AM-10AM)', 'Late Morning (10AM-2PM)', 'Afternoon (2PM-6PM)', 'Evening (6PM-10PM)', 'Night (10PM-2AM)']
  }],
  academicGoal: {
    type: String,
    enum: ['Exam preparation', 'Project work', 'Learning new skills', 'Research assistance', 'Homework help']
  },
  profilePicture: {
    type: String
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);