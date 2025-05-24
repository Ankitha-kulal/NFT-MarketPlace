// controllers/authController.js

require('dotenv').config();
// Import supabase client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);


// Example usage: Register user
exports.registerUser = async (req, res) => {
  try {
    const { email, password, username, walletAddress } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Further logic for profile creation
    res.status(201).json({ user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
