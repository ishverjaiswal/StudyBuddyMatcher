const mongoose = require('mongoose');
const User = require('./backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studybuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test data
const testUser = new User({
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  subjects: ['Mathematics', 'Physics', 'Data Structures'],
  studyStyle: 'Video calls',
  timeSlots: ['Morning (6AM-10AM)', 'Evening (6PM-10PM)'],
  academicGoal: 'Exam preparation'
});

// Save the user
testUser.save()
  .then(user => {
    console.log('User created successfully:', user);
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error creating user:', error);
    mongoose.connection.close();
  });