const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

// Protect these routes with middleware to check authentication
router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
