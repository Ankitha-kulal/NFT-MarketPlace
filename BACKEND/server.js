
require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const nftRoutes = require('./routes/nftRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/nfts', nftRoutes);
app.use('/profiles', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
