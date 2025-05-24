const { supabase } = require('@supabase/supabase-js');

const getProfile = async (req, res) => {
  const { user } = req;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ profile });
};

const updateProfile = async (req, res) => {
  const { user } = req;
  const { username, displayName, bio, avatarUrl, website } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({ username, display_name: displayName, bio, avatar_url: avatarUrl, website })
    .eq('id', user.id);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ profile: data });
};

module.exports = {
  getProfile,
  updateProfile,
};
