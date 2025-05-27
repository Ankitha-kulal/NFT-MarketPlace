import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TrendingUp, Users, Star, Zap, Search, Filter, X, Eye, Heart, ShoppingCart, Palette, Music, Trophy, Gamepad2 } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [trendingNfts, setTrendingNfts] = useState([]);
  const [trendingCreators, setTrendingCreators] = useState([]);
  const [marketStats, setMarketStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [blockchains, setBlockchains] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  
  const { user } = useAuth();
  const { account } = useWeb3();

  // Fetch all data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch NFTs when filters change
  useEffect(() => {
    fetchNFTs();
  }, [searchTerm, selectedCategory, selectedBlockchain, selectedPrice, selectedCreator, sortOrder]);

  // Fetch all initial data
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchNFTs(),
        fetchCategories(),
        fetchBlockchains(),
        fetchTrendingNfts(),
        fetchTrendingCreators(),
        fetchMarketStats()
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch market statistics
  const fetchMarketStats = async () => {
    try {
      // Get total NFTs count
      const { count: totalNfts } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true });

      // Get total creators count
      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get NFTs for sale count
      const { count: nftsForSale } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true })
        .eq('for_sale', true);

      // Get average price
      const { data: priceData } = await supabase
        .from('nfts')
        .select('price')
        .eq('for_sale', true)
        .not('price', 'is', null);

      const avgPrice = priceData?.length > 0 
        ? (priceData.reduce((sum, nft) => sum + (nft.price || 0), 0) / priceData.length).toFixed(2)
        : 0;

      setMarketStats({
        totalNfts: totalNfts || 0,
        totalCreators: totalCreators || 0,
        nftsForSale: nftsForSale || 0,
        avgPrice: avgPrice || 0
      });
    } catch (error) {
      console.error("Error fetching market stats:", error);
    }
  };

  // Fetch trending NFTs (most viewed/liked recently)
  const fetchTrendingNfts = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setTrendingNfts(data || []);
    } catch (error) {
      console.error("Error fetching trending NFTs:", error);
    }
  };

  // Fetch trending creators (most active/popular)
  const fetchTrendingCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          nfts:nfts!creator_id (count)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setTrendingCreators(data || []);
    } catch (error) {
      console.error("Error fetching trending creators:", error);
    }
  };

  // Fetch all categories for filtering
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all blockchains for filtering
  const fetchBlockchains = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('blockchain')
        .not('blockchain', 'is', null);
      
      if (error) throw error;
      
      const uniqueBlockchains = [...new Set(data?.map(item => item.blockchain).filter(Boolean))];
      setBlockchains(uniqueBlockchains);
    } catch (error) {
      console.error("Error fetching blockchains:", error);
    }
  };

  // Fetch NFTs with filtering
  const fetchNFTs = async () => {
    try {
      let query = supabase
        .from('nfts')
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `);
      
      // Apply filters
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedBlockchain) {
        query = query.eq('blockchain', selectedBlockchain);
      }
      
      if (selectedPrice) {
        query = query.lte('price', parseFloat(selectedPrice));
      }
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply sorting
      switch (sortOrder) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'priceAsc':
          query = query.order('price', { ascending: true });
          break;
        case 'priceDesc':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setNfts(data || []);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to load NFTs");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBlockchain('');
    setSelectedPrice('');
    setSelectedCreator('');
    setSortOrder('newest');
  };

  // Toggle filter sidebar on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Info cards data
  const infoCards = [
    {
      title: "Discover Unique Art",
      description: "Explore thousands of unique digital artworks from talented creators worldwide",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
      stat: `${marketStats.totalNfts} NFTs`
    },
    {
      title: "Join the Community",
      description: "Connect with artists, collectors, and enthusiasts in our growing community",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      stat: `${marketStats.totalCreators} Creators`
    },
    {
      title: "Trade & Collect",
      description: "Buy, sell, and trade NFTs with confidence on our secure marketplace",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      stat: `${marketStats.nftsForSale} For Sale`
    },
    {
      title: "Premium Quality",
      description: "All NFTs are verified and authenticated for quality and originality",
      icon: Star,
      color: "from-orange-500 to-red-500",
      stat: `${marketStats.avgPrice} ETH Avg`
    }
  ];

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'art': return Palette;
      case 'music': return Music;
      case 'sports': return Trophy;
      case 'gaming': return Gamepad2;
      default: return Palette;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Explore NFTs
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover, collect, and trade extraordinary digital assets in the world's premier NFT marketplace
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {infoCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${card.color} p-6 rounded-xl text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="relative z-10">
                  <IconComponent className="h-8 w-8 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{card.description}</p>
                  <div className="text-2xl font-bold">{card.stat}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trending Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Trending NFTs */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Trending NFTs</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trendingNfts.slice(0, 4).map((nft) => (
                <div key={nft.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors duration-300">
                  <img 
                    src={nft.image_url || '/api/placeholder/200/150'} 
                    alt={nft.title} 
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate mb-1">{nft.title}</h4>
                    <p className="text-xs text-gray-400">{nft.profiles?.username}</p>
                    {nft.price && (
                      <p className="text-green-400 font-bold text-sm mt-1">{nft.price} ETH</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Creators */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-blue-400">Trending Creators</h2>
            </div>
            <div className="space-y-4">
              {trendingCreators.slice(0, 4).map((creator, index) => (
                <div key={creator.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors duration-300">
                  <div className="flex-shrink-0">
                    <img 
                      src={creator.avatar_url || '/api/placeholder/40/40'} 
                      alt={creator.username} 
                      className="w-10 h-10 rounded-full bg-gray-700"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{creator.username}</p>
                    <p className="text-sm text-gray-400">Artist</p>
                  </div>
                  <div className="text-sm font-bold text-green-400">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search NFTs..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
          </div>
          <button 
            onClick={toggleFilters}
            className="md:hidden bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-1/4 bg-gray-900 rounded-lg p-6 mb-6 md:mb-0`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Filters</h3>
              <button onClick={toggleFilters} className="md:hidden text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Max Price (ETH)</label>
                <input 
                  type="number" 
                  placeholder="Max Price" 
                  value={selectedPrice} 
                  onChange={(e) => setSelectedPrice(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Blockchain</label>
                <select 
                  value={selectedBlockchain} 
                  onChange={(e) => setSelectedBlockchain(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Blockchains</option>
                  {blockchains.map(blockchain => (
                    <option key={blockchain} value={blockchain} className="capitalize">
                      {blockchain}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Sort By</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
              
              <button 
                onClick={resetFilters}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg border border-gray-700 transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="w-full md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : nfts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-lg">
                <Search className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-400">No NFTs Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => {
                  const CategoryIcon = getCategoryIcon(nft.category);
                  return (
                    <div key={nft.id} className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-green-900/20 transition-all duration-300 border border-gray-800 group">
                      <div className="relative overflow-hidden">
                        <img 
                          src={nft.image_url || '/api/placeholder/400/300'} 
                          alt={nft.title} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {nft.for_sale && nft.price && (
                          <div className="absolute top-3 right-3 bg-green-500 text-black font-bold px-3 py-1 rounded-full text-sm">
                            {nft.price} ETH
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center">
                            <img 
                              src={nft.profiles?.avatar_url || '/api/placeholder/32/32'} 
                              alt={nft.profiles?.username || 'Creator'} 
                              className="w-8 h-8 rounded-full mr-3 bg-gray-800"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">{nft.profiles?.username || 'Unknown Creator'}</p>
                              <p className="text-xs text-gray-300">Creator</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-white truncate flex-1">{nft.title}</h3>
                          <CategoryIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{nft.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-400 capitalize">
                            {nft.category || 'Art'}
                          </span>
                          <span className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-400 capitalize">
                            {nft.blockchain || 'ethereum'}
                          </span>
                        </div>
                        <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center">
                          {nft.for_sale ? (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Buy Now
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;