import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  // State for user data
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    linkedin: '',
    discord: '',
    website: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // NFT and activity data
  const [nftCollection, setNftCollection] = useState([]);
  const [createdNfts, setCreatedNfts] = useState([]);
  const [favoriteNfts, setFavoriteNfts] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [stats, setStats] = useState({
    totalNfts: 0,
    totalCreated: 0,
    totalSales: 0,
    totalValue: 0
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collection');
  const [profileImage, setProfileImage] = useState('/images/logo.png');
  const [coverImage, setCoverImage] = useState('/images/nft-banner.jpg');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Function to fetch comprehensive user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Set email from auth
      setUserEmail(user.email || '');
      
      // Fetch extended profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("Profile data fetch warning:", profileError.message);
      }
      
      // Update state with profile data
      if (profileData) {
        setUserName(profileData.username || 'User');
        setFullName(profileData.full_name || '');
        setBio(profileData.bio || 'Passionate NFT collector and digital art enthusiast.');
        setWalletAddress(profileData.wallet_address || '0x123456789abcdef');
        
        if (profileData.avatar_url) {
          setProfileImage(profileData.avatar_url);
        }
        if (profileData.cover_image) {
          const { data } = supabase.storage.from('cover').getPublicUrl(profileData.cover_image);
          setCoverImage(data.publicUrl);
        }
        
        setSocialLinks({
          twitter: profileData.twitter_link || '',
          instagram: profileData.instagram_link || '',
          linkedin: profileData.linkedin_link || '',
          discord: profileData.discord_link || '',
          website: profileData.website_link || ''
        });
      } else {
        setUserName(user.user_metadata?.username || 'User');
      }

      // Fetch NFT data
      await Promise.all([
        fetchNftCollection(user.id),
        fetchCreatedNfts(user.id),
        fetchFavoriteNfts(user.id),
        fetchActivityData(user.id)
      ]);

    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's NFT collection
  const fetchNftCollection = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('nft_ownership')
        .select(`
          *,
          nfts (
            id,
            title,
            description,
            image_url,
            price,
            category,
            created_at,
            creator_id,
            profiles!nfts_creator_id_fkey (username)
          )
        `)
        .eq('owner_id', userId);

      if (error) throw error;
      
      const collection = data?.map(item => item.nfts).filter(Boolean) || [];
      setNftCollection(collection);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalNfts: collection.length,
        totalValue: collection.reduce((sum, nft) => sum + (parseFloat(nft.price) || 0), 0)
      }));
    } catch (error) {
      console.error('Error fetching NFT collection:', error);
    }
  };

  // Fetch user's created NFTs
  const fetchCreatedNfts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('creator_id', userId);

      if (error) throw error;
      
      setCreatedNfts(data || []);
      setStats(prev => ({
        ...prev,
        totalCreated: data?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching created NFTs:', error);
    }
  };

  // Fetch user's favorite NFTs
  const fetchFavoriteNfts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          nfts (
            id,
            title,
            description,
            image_url,
            price,
            category,
            created_at,
            creator_id,
            profiles!nfts_creator_id_fkey (username)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      const favorites = data?.map(item => item.nfts).filter(Boolean) || [];
      setFavoriteNfts(favorites);
    } catch (error) {
      console.error('Error fetching favorite NFTs:', error);
    }
  };

  // Fetch user's activity data
  const fetchActivityData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          nfts (title, image_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setActivityData(data || []);
      
      // Calculate total sales for stats
      const sales = data?.filter(tx => tx.seller_id === userId) || [];
      setStats(prev => ({
        ...prev,
        totalSales: sales.reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0)
      }));
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter NFTs based on search query
  const filterNfts = (nfts) => {
    if (!searchQuery) return nfts;
    return nfts.filter(nft => 
      nft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format price
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render NFT grid
  const renderNftGrid = (nfts) => {
    const filteredNfts = filterNfts(nfts);
    
    if (filteredNfts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No items to display</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {filteredNfts.map((nft) => (
          <div key={nft.id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 border border-gray-700">
            <div className="aspect-square bg-gray-700 relative overflow-hidden">
              <img 
                src={nft.image_url || '/images/placeholder-nft.jpg'} 
                alt={nft.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-nft.jpg';
                }}
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                {nft.category || 'Art'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2 truncate">{nft.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-green-400 font-bold">
                  {formatPrice(nft.price)} ETH
                </div>
                <div className="text-gray-500 text-xs">
                  {formatDate(nft.created_at)}
                </div>
              </div>
              {nft.profiles && (
                <div className="mt-2 text-gray-400 text-xs">
                  by @{nft.profiles.username}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render activity list
  const renderActivity = () => {
    if (activityData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No activity to display</p>
        </div>
      );
    }

    return (
      <div className="py-6 space-y-4">
        {activityData.map((activity) => (
          <div key={activity.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                  <img 
                    src={activity.nfts?.image_url || '/images/placeholder-nft.jpg'} 
                    alt={activity.nfts?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium">{activity.nfts?.title}</h4>
                  <p className="text-gray-400 text-sm capitalize">{activity.transaction_type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">{formatPrice(activity.price)} ETH</div>
                <div className="text-gray-500 text-xs">{formatDate(activity.created_at)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render social media links
  const renderSocialLinks = () => {
    const socialIcons = [];
    
    const socialData = [
      { key: 'twitter', url: socialLinks.twitter, icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
      { key: 'instagram', url: socialLinks.instagram, icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
      { key: 'linkedin', url: socialLinks.linkedin, icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
      { key: 'website', url: socialLinks.website, icon: 'M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-.496-2.995A10.002 10.002 0 0 0 19.931 11zM12.53 4.232c1.035.275 2.007 1.561 2.573 3.268h-5.106c.566-1.707 1.538-2.991 2.533-3.268zM11 20.37a10.988 10.988 0 0 1-3.169-6.37H11v6.37zm0-8.37H7.07A12.778 12.778 0 0 1 7.5 9h3.5v3zm0-5H8.085c.496-1.387 1.364-2.559 2.415-3.232A15.06 15.06 0 0 0 11 7zm2 13.57v-6.57h3.169A10.988 10.988 0 0 1 13 20.37zm0-8.57v-3h3.5c.085.664.14 1.329.16 2a20.03 20.03 0 0 1-.16 1H13zm.8-9.232c1.05.673 1.919 1.845 2.415 3.232H13V4.001c.268.258.529.539.8.767zM4.069 11H6.83c.013-.995.072-1.662.16-2.995a10.02 10.02 0 0 0-2.92 2.995zm2.764 2h-2.764c1.061 1.495 2.679 2.468 4.458 2.995a14.43 14.43 0 0 1-.494-2.995zM19.93 13h-2.764c-.159 1-.3 1.995-.594 2.995a9.983 9.983 0 0 0 3.358-2.995z' }
    ];

    socialData.forEach(({ key, url, icon }) => {
      if (url) {
        if (key === 'discord') {
          socialIcons.push(
            <div 
              key={key}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              title={`Discord: ${url}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
              </svg>
            </div>
          );
        } else {
          socialIcons.push(
            <a 
              key={key}
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d={icon} />
              </svg>
            </a>
          );
        }
      }
    });
    
    return socialIcons.length > 0 ? (
      <div className="flex justify-center space-x-3 mt-4">
        {socialIcons}
      </div>
    ) : null;
  };

  // Get current tab content
  const getCurrentTabContent = () => {
    switch (activeTab) {
      case 'collection':
        return renderNftGrid(nftCollection);
      case 'activity':
        return renderActivity();
      case 'created':
        return renderNftGrid(createdNfts);
      case 'favorites':
        return renderNftGrid(favoriteNfts);
      default:
        return renderNftGrid(nftCollection);
    }
  };

  // Render profile UI with dark green theme
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto px-4 py-10 max-w-6xl">
        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-300 p-4 rounded-lg">
            <p className="font-medium">Error loading profile</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Cover Photo */}
          <div 
            className="h-64 w-full bg-gradient-to-r from-green-600 to-emerald-800 relative"
            style={{ 
              backgroundImage: `url(${coverImage})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/60"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-8">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="absolute -top-20">
                <div className="relative">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-40 h-40 rounded-full border-4 border-gray-800 object-cover bg-gray-800 shadow-2xl"
                  />
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2 border-2 border-gray-800">
                    <div className="bg-green-500 rounded-full w-4 h-4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-20 text-center">
              {loading ? (
                <div className="flex flex-col items-center py-4 space-y-3">
                  <div className="animate-pulse w-40 h-8 bg-gray-700 rounded"></div>
                  <div className="animate-pulse w-32 h-5 bg-gray-700 rounded"></div>
                  <div className="animate-pulse w-48 h-5 bg-gray-700 rounded"></div>
                  <div className="animate-pulse w-36 h-8 bg-gray-700 rounded-full mt-2"></div>
                  <div className="animate-pulse w-64 h-20 bg-gray-700 rounded mt-2"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-white mb-2">{fullName || userName}</h2>
                  <p className="text-green-400 font-medium text-lg">@{userName}</p>
                  <p className="text-gray-400 mt-1">{userEmail}</p>
                  
                  {/* Stats */}
                  <div className="flex justify-center space-x-8 mt-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalNfts}</div>
                      <div className="text-gray-400 text-sm">Collected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalCreated}</div>
                      <div className="text-gray-400 text-sm">Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatPrice(stats.totalValue)}</div>
                      <div className="text-gray-400 text-sm">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatPrice(stats.totalSales)}</div>
                      <div className="text-gray-400 text-sm">Total Sales</div>
                    </div>
                  </div>
                  
                  {/* Wallet Address */}
                  <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-700 text-green-400 rounded-full border border-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <span className="font-mono text-sm">
                      {formatWalletAddress(walletAddress)}
                    </span>
                  </div>
                  
                  {/* Social Links */}
                  {renderSocialLinks()}
                  
                  {/* Bio */}
                  <div className="mt-6 mb-6 px-6">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {bio}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative max-w-md mx-auto">
                <input 
                  type="text" 
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white placeholder-gray-400"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-8">
              <div className="flex justify-center border-b border-gray-700">
                {[
                  { id: 'collection', label: 'Collection', count: stats.totalNfts },
                  { id: 'activity', label: 'Activity', count: activityData.length },
                  { id: 'created', label: 'Created', count: stats.totalCreated },
                  { id: 'favorites', label: 'Favorites', count: favoriteNfts.length }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 border-b-2 font-medium transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'border-green-500 text-green-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="min-h-96">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="animate-pulse">
                        <div className="bg-gray-700 rounded-xl h-64 mb-4"></div>
                        <div className="bg-gray-700 rounded h-4 mb-2"></div>
                        <div className="bg-gray-700 rounded h-3 w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  getCurrentTabContent()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        {!loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Portfolio Value</h3>
                  <p className="text-3xl font-bold text-green-400">{formatPrice(stats.totalValue)} ETH</p>
                  <p className="text-gray-400 text-sm mt-1">Total collection value</p>
                </div>
                <div className="text-green-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Sales</h3>
                  <p className="text-3xl font-bold text-green-400">{formatPrice(stats.totalSales)} ETH</p>
                  <p className="text-gray-400 text-sm mt-1">Revenue from sales</p>
                </div>
                <div className="text-green-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Items Owned</h3>
                  <p className="text-3xl font-bold text-green-400">{stats.totalNfts + stats.totalCreated}</p>
                  <p className="text-gray-400 text-sm mt-1">Total NFTs in portfolio</p>
                </div>
                <div className="text-green-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;