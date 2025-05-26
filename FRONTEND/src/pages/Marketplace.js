// import React, { useState, useEffect } from 'react';
// import { Moon, Sun, Wallet } from 'lucide-react';
// import { createClient } from '@supabase/supabase-js';
// import { toast } from 'react-toastify';
// import { Link } from 'react-router-dom';
// import { useWeb3 } from '../context/Web3Context';
// import { ethers } from 'ethers';

// // Initialize Supabase client
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// const Marketplace = () => {
//   const [nfts, setNfts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [category, setCategory] = useState('');
//   const [darkMode, setDarkMode] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [onChainData, setOnChainData] = useState({});
  
//   // Get web3 context
//   const { 
//     account, 
//     contract, 
//     isCorrectNetwork,
//     connectWallet 
//   } = useWeb3();

//   // Apply dark mode class to body
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [darkMode]);

//   // Fetch NFTs and categories on component mount or when filters change
//   useEffect(() => {
//     fetchNFTs();
//     fetchCategories();
//   }, [searchTerm, category]);
  
//   // Fetch on-chain data when contract is available
//   useEffect(() => {
//     const fetchOnChainNFTData = async () => {
//       if (!contract || nfts.length === 0) return;
      
//       try {
//         const nftDataMap = {};
        
//         // Process NFTs in batches to avoid rate limiting
//         const batchSize = 5;
//         for (let i = 0; i < nfts.length; i += batchSize) {
//           const batch = nfts.slice(i, i + batchSize);
          
//           const promises = batch.map(async (nft) => {
//             if (!nft.token_id) return null;
            
//             try {
//               // Get token listing if available
//               const listing = await contract.getTokenListing(nft.token_id);
              
//               // Get creator
//               const creator = await contract.getCreator(nft.token_id);
              
//               // Get creator info from database
//               let creatorName = "Unknown Creator";
//               try {
//                 const { data } = await supabase
//                   .from('profiles')
//                   .select('username')
//                   .eq('wallet_address', creator.toLowerCase())
//                   .single();
                  
//                 if (data) {
//                   creatorName = data.username;
//                 }
//               } catch (error) {
//                 console.error("Error fetching creator name:", error);
//               }
              
//               return {
//                 id: nft.id,
//                 price: listing.isListed ? listing.price.toString() : "0",
//                 isListed: listing.isListed,
//                 creator,
//                 creatorName
//               };
//             } catch (error) {
//               console.error(`Error fetching data for token ${nft.token_id}:`, error);
//               return null;
//             }
//           });
          
//           const results = await Promise.all(promises);
          
//           // Add valid results to the map
//           results.forEach(result => {
//             if (result) {
//               nftDataMap[result.id] = result;
//             }
//           });
          
//           // Small delay to avoid overwhelming the RPC
//           if (i + batchSize < nfts.length) {
//             await new Promise(resolve => setTimeout(resolve, 500));
//           }
//         }
        
//         setOnChainData(nftDataMap);
//       } catch (error) {
//         console.error("Error fetching on-chain data:", error);
//       }
//     };
    
//     if (contract && nfts.length > 0) {
//       fetchOnChainNFTData();
//     }
//   }, [contract, nfts]);

//   // Fetch all categories for filtering
//   const fetchCategories = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('nfts')
//         .select('category')
//         .not('category', 'is', null);
      
//       if (error) throw error;
      
//       // Get unique categories
//       const uniqueCategories = [...new Set(data.map(item => item.category))];
//       setCategories(uniqueCategories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       toast.error("Failed to load categories");
//     }
//   };

//   // Fetch NFTs from database with filtering
//   const fetchNFTs = async () => {
//     try {
//       setIsLoading(true);
      
//       // Start building query
//       let query = supabase
//         .from('nfts')
//         .select(`
//           *,
//           profiles:creator_id (username, avatar_url)
//         `);
      
//       // Apply category filter
//       if (category) {
//         query = query.eq('category', category);
//       }
      
//       // Apply search term
//       if (searchTerm) {
//         query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
//       }
      
//       // Apply sorting - newest first
//       query = query.order('created_at', { ascending: false });
      
//       const { data, error } = await query;
      
//       if (error) throw error;
      
//       setNfts(data || []);
//     } catch (error) {
//       console.error("Error fetching NFTs:", error);
//       toast.error("Failed to load NFTs");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   const filteredNfts = nfts;

//   return (
//     <div className={`${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors duration-300`}>
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Marketplace</h2>
//             <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Browse and trade NFTs.</p>
//           </div>
//           <div className="flex items-center space-x-3">
//             {!account && (
//               <button
//                 onClick={connectWallet}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
//                   darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
//                 } text-white transition-colors`}
//               >
//                 <Wallet size={18} />
//                 <span>Connect</span>
//               </button>
//             )}
//             {account && (
//               <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
//                 <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   {account.substring(0, 6)}...{account.substring(38)}
//                 </span>
//               </div>
//             )}
//             <button 
//               onClick={toggleDarkMode} 
//               className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
//               aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//             </button>
//           </div>
//         </div>
        
//         <div className="flex flex-col md:flex-row gap-4 mb-8">
//           <div className="w-full md:w-1/4">
//             <select 
//               className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                 darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
//               }`}
//               onChange={(e) => setCategory(e.target.value)}
//               value={category}
//             >
//               <option value="">All Categories</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
//               ))}
//             </select>
//           </div>
//           <div className="w-full md:w-3/4">
//             <div className="relative">
//               <input 
//                 type="text" 
//                 placeholder="Search NFTs..." 
//                 className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                   darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
//                 }`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)} 
//               />
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                 <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {isLoading ? (
//           <div className="flex justify-center my-12">
//             <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-green-500' : 'border-green-600'}`}></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredNfts.map((nft) => (
//               <Link 
//                 to={`/nft/${nft.id}`}
//                 key={nft.id}
//                 className={`rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:scale-105 ${
//                   darkMode ? 'bg-gray-800' : 'bg-white'
//                 }`}
//               >
//                 <div className="relative">
//                   <img 
//                     src={nft.image_url || '/api/placeholder/400/320'} 
//                     alt={nft.title} 
//                     className="w-full h-64 object-cover"
//                   />
//                   <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
//                     {nft.category}
//                   </div>
//                 </div>
//                 <div className="p-5">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{nft.title}</h3>
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
//                     }`}>
//                       {onChainData[nft.id]?.isListed
//                         ? `${ethers.formatEther(onChainData[nft.id].price)} ETH`
//                         : `${nft.price} ETH`}
//                     </span>
//                   </div>
//                   <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                     {nft.description || 'No description available'}
//                   </p>
//                   <div className={`flex justify-between items-center pt-3 border-t ${
//                     darkMode ? 'border-gray-700' : 'border-gray-100'
//                   }`}>
//                     <div className="flex items-center">
//                       <img 
//                         src={nft.profiles?.avatar_url || '/api/placeholder/32/32'} 
//                         alt={nft.profiles?.username || 'Creator'} 
//                         className="w-6 h-6 rounded-full mr-2 bg-gray-200"
//                       />
//                       <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {onChainData[nft.id]?.creatorName || nft.profiles?.username || 'Unknown Creator'}
//                       </span>
//                     </div>
//                     <div className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
//                       {nft.for_sale ? 'Buy Now' : 'View'}
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
        
//         {!isLoading && filteredNfts.length === 0 && (
//           <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
//             <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No NFTs found</h3>
//             <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try changing your search or filter criteria.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Marketplace;


import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { Moon, Sun, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing!");
}
const supabase = createClient(supabaseUrl, supabaseKey);

const Marketplace = () => {
  /** @type {[any[], Function]} */
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  /** @type {[string[], Function]} */
  const [categories, setCategories] = useState([]);
  const [onChainData, setOnChainData] = useState({});
  const [activeTab, setActiveTab] = useState('NFTs');
  
  
  // Get web3 context
  const { 
    account, 
    contract, 
    isCorrectNetwork,
    connectWallet 
  } = useWeb3();

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch NFTs and categories on component mount or when filters change
  useEffect(() => {
    fetchNFTs();
    fetchCategories();
  }, [searchTerm, category]);
  
  // Fetch on-chain data when contract is available
  useEffect(() => {
    const fetchOnChainNFTData = async () => {
      if (!contract || nfts.length === 0) return;
      
      try {
        const nftDataMap = {};
        
        // Process NFTs in batches to avoid rate limiting
        const batchSize = 5;
        for (let i = 0; i < nfts.length; i += batchSize) {
          const batch = nfts.slice(i, i + batchSize);
          
          const promises = batch.map(async (nft) => {
            if (!nft.token_id) return null;
            
            try {
              // Get token listing if available
              const listing = await contract.getTokenListing(nft.token_id);
              
              // Get creator
              const creator = await contract.getCreator(nft.token_id);
              
              // Get creator info from database
              let creatorName = "Unknown Creator";
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('wallet_address', creator.toLowerCase())
                  .single();
                  
                if (data) {
                  creatorName = data.username;
                }
              } catch (error) {
                console.error("Error fetching creator name:", error);
              }
              
              return {
                id: nft.id,
                price: listing.isListed ? listing.price.toString() : "0",
                isListed: listing.isListed,
                creator,
                creatorName
              };
            } catch (error) {
              console.error(`Error fetching data for token ${nft.token_id}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(promises);
          
          // Add valid results to the map
          results.forEach(result => {
            if (result) {
              nftDataMap[result.id] = result;
            }
          });
          
          // Small delay to avoid overwhelming the RPC
          if (i + batchSize < nfts.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        setOnChainData(nftDataMap);
      } catch (error) {
        console.error("Error fetching on-chain data:", error);
      }
    };
    
    if (contract && nfts.length > 0) {
      fetchOnChainNFTData();
    }
  }, [contract, nfts]);

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

  // Fetch NFTs from database with filtering
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
      if (category) {
        query = query.eq('category', category);
      }
      
      // Apply search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply sorting - newest first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setNfts(data || []);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to load NFTs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const allCreators = [...new Set(nfts.map(nft => nft.profiles?.username).filter(Boolean))];

  const filteredCreators = allCreators.filter(creator =>
  creator.toLowerCase().includes(searchTerm.toLowerCase())
);


  // const filteredNfts = nfts;

  const filteredNfts = nfts.filter(nft => 
  nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  nft.category.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className={`${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Marketplace</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Browse and trade NFTs.</p>
          </div>
          <div className="flex items-center space-x-3">
            {!account && (
              <button
                onClick={connectWallet}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
              >
                <Wallet size={18} />
                <span>Connect</span>
              </button>
            )}
            {account && (
              <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
              </div>
            )}
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-1/4">
            <select 
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-3/4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search NFTs..." 
                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* .................... */}
        <div className="flex space-x-4 mb-6">
  {['NFTs', 'Creators'].map(tab => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-green-600 text-white'
          : darkMode
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {tab}
    </button>
  ))}
</div>

{isLoading ? (
  <div className="flex justify-center my-12">
    <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-green-500' : 'border-green-600'}`}></div>
  </div>
) : (
  activeTab === 'NFTs' ? (
    filteredNfts.length === 0 ? (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
        <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No NFTs found</h3>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try changing your search or filter criteria.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNfts.map((nft) => (
          <Link 
            to={`/nft/${nft.id}`}
            key={nft.id}
            className={`rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:scale-105 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="relative">
              <img 
                src={nft.image_url || '/api/placeholder/400/320'} 
                alt={nft.title} 
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                {nft.category}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{nft.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  {onChainData[nft.id]?.isListed
                    ? `${ethers.formatEther(onChainData[nft.id].price)} ETH`
                    : `${nft.price} ETH`}
                </span>
              </div>
              <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {nft.description || 'No description available'}
              </p>
              <div className={`flex justify-between items-center pt-3 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="flex items-center">
                  <img 
                    src={nft.profiles?.avatar_url || '/api/placeholder/32/32'} 
                    alt={nft.profiles?.username || 'Creator'} 
                    className="w-6 h-6 rounded-full mr-2 bg-gray-200"
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {onChainData[nft.id]?.creatorName || nft.profiles?.username || 'Unknown Creator'}
                  </span>
                </div>
                <div className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                  {nft.for_sale ? 'Buy Now' : 'View'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCreators.map((creatorName, index) => (
        <div
          key={index}
          className={`rounded-xl shadow-md p-6 flex items-center space-x-4 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <img
            src="/api/placeholder/64/64"
            alt={creatorName}
            className="w-12 h-12 rounded-full bg-gray-300"
          />
          <span className="text-lg font-medium">{creatorName}</span>
        </div>
      ))}
    </div>
  )
)}
{!isLoading && activeTab === 'Creators' && filteredCreators.length === 0 && (
  <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Creators found</h3>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try changing your search or filter criteria.</p>
          </div>
)}
  </div>
    </div>
  );
};

export default Marketplace;
