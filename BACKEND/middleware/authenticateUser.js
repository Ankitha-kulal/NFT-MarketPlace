const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { user, error } = await supabase.auth.api.getUser(token);

  if (error) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  next();
};

module.exports = authenticateUser;
