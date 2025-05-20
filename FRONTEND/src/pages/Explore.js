import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [blockchains, setBlockchains] = useState(['ethereum', 'polygon']);
  const [sortOrder, setSortOrder] = useState('newest');
  
  const { user } = useAuth();
  const { account } = useWeb3();

  // Fetch NFTs and categories on component mount or when filters change
  useEffect(() => {
    fetchNFTs();
    fetchCategories();
  }, [searchTerm, selectedCategory, selectedBlockchain, selectedPrice, selectedCreator, sortOrder]);

  // Fetch all categories for filtering
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Get unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch NFTs with filtering
  const fetchNFTs = async () => {
    try {
      setIsLoading(true);
      
      // Start building query
      let query = supabase
        .from('nfts')
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `);
      
      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      // Apply blockchain filter
      if (selectedBlockchain) {
        query = query.eq('blockchain', selectedBlockchain);
      }
      
      // Apply max price filter
      if (selectedPrice) {
        query = query.lte('price', parseFloat(selectedPrice));
      }
      
      // Apply search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply creator filter
      if (selectedCreator) {
        query = query.ilike('profiles.username', `%${selectedCreator}%`);
      }
      
      // Apply sorting
      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortOrder === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortOrder === 'priceAsc') {
        query = query.order('price', { ascending: true });
      } else if (sortOrder === 'priceDesc') {
        query = query.order('price', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setNfts(data);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to load NFTs");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-2 text-green-400">Explore NFTs</h2>
        <p className="text-gray-400 mb-6">Discover and collect extraordinary NFTs</p>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Search and Toggle Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search NFTs..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={toggleFilters}
            className="md:hidden bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Mobile (Conditional) */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-1/4 bg-gray-900 rounded-lg p-6 mb-6 md:mb-0`}>
            <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center justify-between">
              <span>Filters</span>
              <button onClick={toggleFilters} className="md:hidden text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Price (ETH)</label>
              <input 
                type="number" 
                placeholder="Max Price" 
                value={selectedPrice} 
                onChange={(e) => setSelectedPrice(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Blockchain</label>
              <select 
                value={selectedBlockchain} 
                onChange={(e) => setSelectedBlockchain(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Blockchains</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Creator</label>
              <input 
                type="text" 
                placeholder="Creator Name" 
                value={selectedCreator} 
                onChange={(e) => setSelectedCreator(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="mb-4">
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
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg border border-gray-700"
            >
              Clear Filters
            </button>
          </div>

          {/* NFT Grid */}
          <div className="w-full md:w-3/4">
            {!isLoading && nfts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-900 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-400">No NFTs Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-green-900/30 transition-all duration-300 border border-gray-800">
                    <div className="relative">
                      <img 
                        src={nft.image_url || '/api/placeholder/400/300'} 
                        alt={nft.title} 
                        className="w-full h-48 object-cover"
                      />
                      {nft.for_sale && (
                        <div className="absolute top-3 right-3 bg-green-500 text-black font-bold px-2 py-1 rounded-lg text-sm">
                          {nft.price} ETH
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex items-center">
                          <img 
                            src={nft.profiles?.avatar_url || '/api/placeholder/32/32'} 
                            alt={nft.profiles?.username || 'Creator'} 
                            className="w-6 h-6 rounded-full mr-2 bg-gray-800"
                          />
                          <p className="text-sm text-gray-300">{nft.profiles?.username || 'Unknown Creator'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-1 text-white truncate">{nft.title}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{nft.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400 capitalize">
                          {nft.category || 'Art'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400 capitalize">
                          {nft.blockchain || 'ethereum'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-full font-medium transition-colors duration-300">
                          {nft.for_sale ? 'Buy Now' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;