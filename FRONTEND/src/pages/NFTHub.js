// import React from 'react';
// import { Link } from 'react-router-dom';

// const NFTHub = () => {
//   return (
//     <div className="container" style={{ marginTop: '50px' }}>
//       <h3 style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>NFT Hub</h3>
//       <p style={{ color: 'black', textAlign: 'center' }}>All things NFT in one place.</p>
      
//       {/* Create & Sell New NFT */}
//       <div className="center-align" style={{ marginBottom: '20px' }}>
//         <Link to="/nft-create" className="btn blue darken-3" style={{ color: 'white' }}>Create & Sell New NFT</Link>
//       </div>
      
//       {/* NFT Cards */}
//       <div className="row">
//         {/* NFT 1 */}
//         <div className="col s12 m4">
//           <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
//             <div className="card-image">
//               <img src="/images/nft1.jpg" alt="NFT 1" />
//             </div>
//             <div className="card-content">
//               <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 1</h6>
//               <p style={{ color: 'black' }}>Status: Owned</p>
//               <p style={{ color: 'black' }}>Price: 0.1 ETH</p>
//               <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
//             </div>
//           </div>
//         </div>
        
//         {/* NFT 2 */}
//         <div className="col s12 m4">
//           <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
//             <div className="card-image">
//               <img src="/images/nft2.jpg" alt="NFT 2" />
//             </div>
//             <div className="card-content">
//               <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 2</h6>
//               <p style={{ color: 'black' }}>Status: For Sale</p>
//               <p style={{ color: 'black' }}>Price: 0.2 ETH</p>
//               <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
//             </div>
//           </div>
//         </div>
        
//         {/* NFT 3 */}
//         <div className="col s12 m4">
//           <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
//             <div className="card-image">
//               <img src="/images/nft3.jpg" alt="NFT 3" />
//             </div>
//             <div className="card-content">
//               <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 3</h6>
//               <p style={{ color: 'black' }}>Status: Owned</p>
//               <p style={{ color: 'black' }}>Price: 0.15 ETH</p>
//               <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NFTHub;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NFTHub = () => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'forSale', 'myNFTs'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'priceAsc', 'priceDesc'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const { account, contract, isCorrectNetwork, connectWallet } = useWeb3();

  // Fetch NFTs on component mount
  useEffect(() => {
    fetchNFTs();
    fetchCategories();
  }, [filter, sortOrder, selectedCategory, searchTerm, account]);

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

  // Fetch NFTs with filtering and sorting
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
      
      // Apply filters
      if (filter === 'forSale') {
        query = query.eq('for_sale', true);
      } else if (filter === 'myNFTs' && user) {
        query = query.eq('owner_id', user.id);
      }
      
      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      // Apply search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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

  const handleBuyNFT = async (nft) => {
    if (!account) {
      try {
        await connectWallet();
        return;
      } catch (error) {
        toast.error("Please connect your wallet to buy NFTs");
        return;
      }
    }
    
    if (!isCorrectNetwork) {
      toast.error("Please switch to the correct network to buy NFTs");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get current price from blockchain to ensure it's up-to-date
      const tokenId = nft.token_id;
      const nftItem = await contract.getNFTItem(tokenId);
      const price = nftItem.price;
      
      const transaction = await contract.buyNFT(tokenId, {
        value: price
      });
      
      toast.info("Transaction submitted! Waiting for confirmation...");
      
      // Wait for transaction confirmation
      await transaction.wait();
      
      // Update NFT ownership in database
      const { error } = await supabase
        .from('nfts')
        .update({
          owner_id: user.id,
          for_sale: false,
          blockchain_status: 'owned',
          price: 0
        })
        .eq('token_id', tokenId);
      
      if (error) throw error;
      
      toast.success("Successfully purchased NFT!");
      
      // Refresh the NFT list
      fetchNFTs();
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error(`Failed to purchase NFT: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListForSale = async (nft, newPrice) => {
    if (!account) {
      try {
        await connectWallet();
        return;
      } catch (error) {
        toast.error("Please connect your wallet to list NFTs");
        return;
      }
    }
    
    if (!isCorrectNetwork) {
      toast.error("Please switch to the correct network to list NFTs");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(newPrice.toString());
      
      const tokenId = nft.token_id;
      
      // Call contract method to list the NFT
      const transaction = await contract.listNFT(tokenId, priceInWei);
      
      toast.info("Transaction submitted! Waiting for confirmation...");
      
      // Wait for transaction confirmation
      await transaction.wait();
      
      // Update NFT status in database
      const { error } = await supabase
        .from('nfts')
        .update({
          for_sale: true,
          blockchain_status: 'listed',
          price: parseFloat(newPrice)
        })
        .eq('token_id', tokenId);
      
      if (error) throw error;
      
      toast.success("Successfully listed NFT for sale!");
      
      // Refresh the NFT list
      fetchNFTs();
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast.error(`Failed to list NFT: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelListing = async (nft) => {
    if (!account) {
      try {
        await connectWallet();
        return;
      } catch (error) {
        toast.error("Please connect your wallet to cancel listings");
        return;
      }
    }
    
    if (!isCorrectNetwork) {
      toast.error("Please switch to the correct network to cancel listings");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const tokenId = nft.token_id;
      
      // Call contract method to cancel the listing
      const transaction = await contract.cancelListing(tokenId);
      
      toast.info("Transaction submitted! Waiting for confirmation...");
      
      // Wait for transaction confirmation
      await transaction.wait();
      
      // Update NFT status in database
      const { error } = await supabase
        .from('nfts')
        .update({
          for_sale: false,
          blockchain_status: 'owned',
          price: 0
        })
        .eq('token_id', tokenId);
      
      if (error) throw error;
      
      toast.success("Successfully canceled NFT listing!");
      
      // Refresh the NFT list
      fetchNFTs();
    } catch (error) {
      console.error("Error canceling listing:", error);
      toast.error(`Failed to cancel listing: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ marginTop: '30px' }}>
        <div className="col s12 m8">
          <h3 className="header black-text">NFT Hub</h3>
        </div>
        <div className="col s12 m4 right-align">
          <Link to="/nft/create" className="btn-large blue darken-2 waves-effect waves-light" style={{ marginBottom: '10px' }}>
            <i className="material-icons left">add</i>
            Create NFT
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row card-panel grey lighten-4">
        <div className="col s12 m4">
          <div className="input-field">
            <i className="material-icons prefix">search</i>
            <input 
              id="search" 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description"
            />
            <label htmlFor="search" className={searchTerm ? "active" : ""}>Search</label>
          </div>
        </div>
        
        <div className="col s12 m2">
          <div className="input-field">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="browser-default"
            >
              <option value="all">All NFTs</option>
              <option value="forSale">For Sale</option>
              {user && <option value="myNFTs">My NFTs</option>}
            </select>
          </div>
        </div>
        
        <div className="col s12 m2">
          <div className="input-field">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="browser-default"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="col s12 m4">
          <div className="input-field">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="browser-default"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="center" style={{ margin: '50px 0' }}>
          <div className="preloader-wrapper big active">
            <div className="spinner-layer spinner-blue-only">
              <div className="circle-clipper left">
                <div className="circle"></div>
              </div>
              <div className="gap-patch">
                <div className="circle"></div>
              </div>
              <div className="circle-clipper right">
                <div className="circle"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <div className="row">
        {nfts.length === 0 && !isLoading ? (
          <div className="col s12 center-align">
            <h5>No NFTs found matching your criteria</h5>
          </div>
        ) : (
          nfts.map((nft) => (
            <div key={nft.id} className="col s12 m6 l4">
              <div className="card hoverable">
                <div className="card-image">
                  <img 
                    src={nft.image_url} 
                    alt={nft.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {nft.for_sale && (
                    <span className="card-title price-tag" style={{ 
                      background: 'rgba(0,0,0,0.7)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '1.2rem'
                    }}>
                      {nft.price} ETH
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <span className="card-title truncate">{nft.title}</span>
                  <p className="truncate grey-text">{nft.description}</p>
                  <div className="chip">{nft.category}</div>
                  <p className="creator">
                    Creator: {nft.profiles?.username || 'Unknown'}
                  </p>
                </div>
                <div className="card-action">
                  <Link to={`/nft/${nft.id}`} className="blue-text">View Details</Link>
                  
                  {/* Buy Button - Show if for sale and not owned by user */}
                  {nft.for_sale && user && nft.owner_id !== user.id && (
                    <a 
                      href="#!" 
                      className="right green-text"
                      onClick={() => handleBuyNFT(nft)}
                    >
                      Buy
                    </a>
                  )}
                  
                  {/* Sell / Cancel Buttons - Show if owned by user */}
                  {user && nft.owner_id === user.id && !nft.for_sale && (
                    <a 
                      href="#!" 
                      className="right blue-text modal-trigger"
                      onClick={() => {
                        const price = prompt("Enter listing price in ETH:", "0.1");
                        if (price && !isNaN(parseFloat(price)) && parseFloat(price) > 0) {
                          handleListForSale(nft, parseFloat(price));
                        }
                      }}
                    >
                      List for Sale
                    </a>
                  )}
                  
                  {user && nft.owner_id === user.id && nft.for_sale && (
                    <a 
                      href="#!" 
                      className="right orange-text"
                      onClick={() => handleCancelListing(nft)}
                    >
                      Cancel Listing
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NFTHub;