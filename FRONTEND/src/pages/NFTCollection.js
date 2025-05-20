import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useWeb3 } from '../context/Web3Context';

const NFTCollection = () => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: 'John Doe',
    bio: 'Digital artist & NFT collector. Exploring the world of blockchain creativity.',
    followers: '26K',
    profileImage: '/images/profile.jpg',
    bannerImage: '/images/nft-banner.jpg'
  });
  
  // Stats for the collection
  const [stats, setStats] = useState({
    floorPrice: '0.00',
    volume: '0',
    totalItems: '0'
  });
  
  // Get Web3 context to show the user's connected wallet
  const { account } = useWeb3();

  // Fetch NFTs from Supabase when component mounts
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        
        // Fetch user's NFTs from Supabase
        const { data, error } = await supabase
          .from('nfts')
          .select('*')
          .eq('owner_id', userId);
          
        if (error) throw error;
        
        setNfts(data || []);
        
        // Update stats based on the NFTs
        if (data && data.length > 0) {
          // Calculate floor price (lowest price of NFTs for sale)
          const forSaleNfts = data.filter(nft => nft.for_sale && nft.price > 0);
          const floorPrice = forSaleNfts.length > 0 
            ? Math.min(...forSaleNfts.map(nft => nft.price)).toFixed(3)
            : '0.00';
            
          // Count total items
          const totalItems = data.length.toString();
          
          // You would normally calculate volume from transaction history
          // Here we'll just use a placeholder or sum of prices
          const volume = data
            .reduce((total, nft) => total + (nft.price || 0), 0)
            .toFixed(3);
            
          setStats({
            floorPrice,
            volume,
            totalItems
          });
        }
        
        // Fetch user profile (assume you have a users or profiles table)
        // This is a placeholder - adjust according to your actual database structure
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileData && !profileError) {
          setUserProfile({
            username: profileData.username || 'John Doe',
            bio: profileData.bio || 'Digital artist & NFT collector',
            followers: profileData.followers_count || '0',
            profileImage: profileData.avatar_url || '/images/profile.jpg',
            bannerImage: profileData.banner_url || '/images/nft-banner.jpg'
          });
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-green-400">Loading your NFT collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Error loading NFTs: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      {/* Header with background */}
      <div className="relative h-64 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: `url('${userProfile.bannerImage}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32">
        {/* Profile Section */}
        <div className="bg-gray-800 rounded-xl shadow-2xl mb-8 overflow-hidden border border-gray-700">
          <div className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Profile Image */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                  <img
                    src={userProfile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:ml-6 flex-grow">
                <h2 className="text-2xl font-bold text-white mb-1">{userProfile.username}</h2>
                <p className="text-gray-300 mb-3">{userProfile.bio}</p>
                {account && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                  </div>
                )}
              </div>

              {/* Followers */}
              <div className="mt-4 md:mt-0 md:ml-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-green-500">
                  <span className="text-xl font-bold text-green-400">{userProfile.followers}</span>
                </div>
                <span className="text-sm text-gray-400 mt-1">Followers</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:border-green-500 transition-colors">
                <p className="text-sm text-gray-400 mb-1">Floor Price</p>
                <p className="text-xl font-bold text-green-400">{stats.floorPrice} ETH</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:border-green-500 transition-colors">
                <p className="text-sm text-gray-400 mb-1">Volume</p>
                <p className="text-xl font-bold text-green-400">{stats.volume} ETH</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:border-green-500 transition-colors">
                <p className="text-sm text-gray-400 mb-1">Items</p>
                <p className="text-xl font-bold text-green-400">{stats.totalItems}</p>
              </div>
            </div>

            {/* Social Media & Follow Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-700">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-pink-500 hover:text-pink-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Follow
              </button>
            </div>
          </div>
        </div>

        {/* NFT Collection Section */}
        <div>
          {/* Header & Create button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
              <span className="inline-block mr-2">
                <svg className="w-6 h-6 inline-block text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
              </span>
              My NFT Collection
            </h2>
            <a href="/nft-create" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New NFT
            </a>
          </div>

          {/* Empty state */}
          {nfts.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-white">You don't have any NFTs yet</h3>
              <p className="mt-2 text-gray-400">Create your first NFT by clicking the button above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative">
                    <img 
                      src={nft.image_url} 
                      alt={nft.title} 
                      className="w-full h-48 object-cover" 
                    />
                    {nft.for_sale && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-green-400 font-bold py-1 px-3 rounded-full text-sm border border-green-500">
                        {nft.price} ETH
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white truncate">{nft.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 h-10 overflow-hidden">{nft.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md">
                        {nft.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${nft.for_sale 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-yellow-900 text-yellow-300'}`}>
                        {nft.for_sale ? 'For Sale' : 'Not Listed'}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <a href={`/nft/${nft.id}`} className="text-green-400 hover:text-green-300 text-sm font-medium">
                        View Details
                      </a>
                      {!nft.for_sale && (
                        <a href={`/nft/list/${nft.id}`} className="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                          List for Sale
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - shown only when there are enough NFTs */}
          {nfts.length > 12 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center space-x-1">
                <a href="#" className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </a>
                <a href="#" className="px-4 py-2 rounded-md bg-green-600 text-white font-medium">1</a>
                <a href="#" className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">2</a>
                <a href="#" className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">3</a>
                <a href="#" className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCollection;