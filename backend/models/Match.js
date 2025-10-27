const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  compatibilityScore: {
    type: Number,
    required: true
  },
  commonSubjects: [{
    type: String
  }],
  commonTimeSlots: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);