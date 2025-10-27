const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById } = require('../controllers/userController');

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;