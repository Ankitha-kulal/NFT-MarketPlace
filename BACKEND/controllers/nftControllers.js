require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY; 

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY);

if (!supabaseUrl || !supabaseKey) {
    console.log("Error: SUPABASE_URL or SUPABASE_KEY is missing in the .env file");
    process.exit(1); // Exit the process with error if variables are missing
  }

const createNFT = async (req, res) => {
  const { title, description, imageUrl, contractAddress, tokenId, price, currency } = req.body;

  const { user } = req;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const { data, error: nftError } = await supabase
    .from('nfts')
    .insert([
      {
        title,
        description,
        image_url: imageUrl,
        contract_address: contractAddress,
        token_id: tokenId,
        price,
        currency: currency || 'ETH',
        creator_id: profile.id,
        owner_id: profile.id,
      },
    ]);

  if (nftError) return res.status(400).json({ error: nftError.message });
  return res.status(201).json({ nft: data });
};

module.exports = {
  createNFT,
};
