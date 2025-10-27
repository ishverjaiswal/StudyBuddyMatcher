const express = require('express');
const router = express.Router();
const { findMatches, getMatches } = require('../controllers/matchController');

// Find matches for a user
router.get('/find/:userId', findMatches);

// Get saved matches for a user
router.get('/:userId', getMatches);

module.exports = router;