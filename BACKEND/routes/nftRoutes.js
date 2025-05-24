const express = require('express');
const router = express.Router();
const { createNFT } = require('../controllers/nftControllers');

// Protect this route with middleware to check authentication
router.post('/', createNFT);

module.exports = router;
