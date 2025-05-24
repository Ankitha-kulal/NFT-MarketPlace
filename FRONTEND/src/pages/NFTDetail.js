import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { ArrowLeft, Clock, Tag, User, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NFTDetail = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [onChainData, setOnChainData] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [auction, setAuction] = useState(null);
const [bidAmount, setBidAmount] = useState('');
const [bidsRefundable, setBidsRefundable] = useState(false);

  // Get web3 context
  const { 
    account, 
    contract, 
    isCorrectNetwork,
    connectWallet,
    switchNetwork
  } = useWeb3();

  // Check for dark mode on component mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Fetch NFT details, transaction history and blockchain data
  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch NFT details from database
        const { data: nftData, error: nftError } = await supabase
          .from('nfts')
          .select(`
            *,
            profiles:creator_id (username, avatar_url)
          `)
          .eq('id', id)
          .single();
        
        if (nftError) throw nftError;
        setNft(nftData);
        
        // Set creator profile from the joined data
        if (nftData.profiles) {
          setCreatorProfile(nftData.profiles);
        } else if (nftData.creator_id) {
          // If profile wasn't joined properly, fetch it separately
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', nftData.creator_id)
            .single();
            
          if (!profileError && profileData) {
            setCreatorProfile(profileData);
          }
        }
        
        // Fetch transaction history
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select(`
            *,
            buyer:buyer_id (username, avatar_url),
            seller:seller_id (username, avatar_url)
          `)
          .eq('nft_id', id)
          .order('created_at', { ascending: false });
        
        if (txError) throw txError;
        setTransactions(txData || []);
        
      } catch (error) {
        console.error("Error fetching NFT details:", error);
        toast.error("Failed to load NFT details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNFTDetails();
    }
  }, [id]);
  
  // Fetch on-chain data when contract is available
  // useEffect(() => {
  //   const fetchOnChainData = async () => {
  //     if (!nft || !contract || !nft.token_id) return;
      
  //     try {
  //       // Fetch token details from blockchain
  //       const tokenId = nft.token_id;
        
  //       // Get token owner
  //       const ownerAddress = await contract.ownerOf(tokenId);
        
  //       // Get token URI
  //       const tokenURI = await contract.tokenURI(tokenId);
        
  //       // Get token creator
  //       const creator = await contract.getCreator(tokenId);
        
  //       // Get token price if listed
  //       const listing = await contract.getTokenListing(tokenId);
  //       const price = listing.price;
  //       const isListed = listing.isListed;
        
  //       // Get creator info from contract or database
  //       let creatorName = "Unknown Creator";
  //       try {
  //         const { data } = await supabase
  //           .from('profiles')
  //           .select('username, avatar_url')
  //           .eq('wallet_address', creator.toLowerCase())
  //           .single();
            
  //         if (data) {
  //           creatorName = data.username;
  //         }
  //       } catch (error) {
  //         console.error("Error fetching creator info:", error);
  //       }
        
  //       setOnChainData({
  //         owner: ownerAddress,
  //         creator,
  //         creatorName,
  //         tokenURI,
  //         price: price.toString(),
  //         isListed
  //       });
        
  //     } catch (error) {
  //       console.error("Error fetching on-chain data:", error);
  //       toast.error("Failed to load blockchain data");
  //     }
  //   };
    
  //   if (contract && nft) {
  //     fetchOnChainData();
  //   }
  // }, [contract, nft]);
// useEffect(() => {
//   const fetchOnChainData = async () => {
//     if (!nft || !contract || !nft.token_id) return;

//     try {


//       const tokenId = nft.token_id;

//       // Get token owner
//       const ownerAddress = await contract.ownerOf(tokenId);

//       // Get token URI
//       const tokenURI = await contract.tokenURI(tokenId);

//       // Get listing info
//       const listing = await contract.listings(tokenId);
//       const price = listing.price;
//       const isListed = listing.isListed;

//       // Set on-chain data
//       setOnChainData({
//         owner: ownerAddress,
//         tokenURI,
//         price: price.toString(),
//         isListed
//       });

//       // 🔁 Get on-chain transaction history
//       const [
//         fromAddresses,
//         toAddresses,
//         prices,
//         timestamps,
//         transactionTypes
//       ] = await contract.getTokenTransactionHistory(tokenId);

//       const chainTxHistory = fromAddresses.map((from, index) => ({
//         from: fromAddresses[index],
//         to: toAddresses[index],
//         price: ethers.formatEther(prices[index]),
//         timestamp: new Date(Number(timestamps[index]) * 1000).toISOString(),
//         type: transactionTypes[index]
//       }));

//       setTransactions(chainTxHistory);

//     } catch (error) {
//       console.error("Error fetching on-chain data:", error);
//       toast.error("Failed to load blockchain data");
//     }
//   };

//   if (contract && nft) {
//     fetchOnChainData();
//   }
// }, [contract, nft]);

useEffect(() => {
  const fetchOnChainData = async () => {
    if (!nft || !contract || !nft.token_id) return;

    try {
      const tokenId = nft.token_id;

      // Get token owner
      const ownerAddress = await contract.ownerOf(tokenId);

      // Get token URI
      const tokenURI = await contract.tokenURI(tokenId);

      // Get listing info
      const listing = await contract.listings(tokenId);
      const price = listing.price;
      const isListed = listing.isListed;

      // Set on-chain data
      setOnChainData({
        owner: ownerAddress,
        tokenURI,
        price: price.toString(),
        isListed
      });

      // 🔁 Get on-chain transaction history
      const [
        fromAddresses,
        toAddresses,
        prices,
        timestamps,
        transactionTypes
      ] = await contract.getTokenTransactionHistory(tokenId);

      const chainTxHistory = fromAddresses.map((from, index) => ({
        from: fromAddresses[index],
        to: toAddresses[index],
        price: ethers.formatEther(prices[index]),
        timestamp: new Date(Number(timestamps[index]) * 1000).toISOString(),
        type: transactionTypes[index]
      }));

      setTransactions(chainTxHistory);

      // 🔁 Get auction info if available
      const auctionData = await contract.auctions(tokenId);
      if (auctionData.active) {
        setAuction({
          seller: auctionData.seller,
          highestBid: auctionData.highestBid.toString(),
          highestBidder: auctionData.highestBidder,
          endTime: auctionData.endTime.toString()
        });

        const refund = await contract.bids(tokenId, account);
        setBidsRefundable(refund > 0n);
      }

    } catch (error) {
      console.error("Error fetching on-chain data:", error);
      toast.error("Failed to load blockchain data");
    }
  };

  if (contract && nft) {
    fetchOnChainData();
  }
}, [contract, nft, account]); // 👈 include account so refund check works


  // Format date for transaction history
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get creator display name with proper fallbacks
  const getCreatorDisplayName = () => {
    // First try on-chain data
    if (onChainData?.creatorName && onChainData.creatorName !== "Unknown Creator") {
      return onChainData.creatorName;
    }
    
    // Then try profile data from database
    if (creatorProfile?.username) {
      return creatorProfile.username;
    }
    
    // Fallback to profiles data from joined query
    if (nft?.profiles?.username) {
      return nft.profiles.username;
    }
    
    return "Unknown Creator";
  };

  // Get creator avatar with proper fallbacks
  const getCreatorAvatar = () => {
    if (creatorProfile?.avatar_url) {
      return creatorProfile.avatar_url;
    }
    
    if (nft?.profiles?.avatar_url) {
      return nft.profiles.avatar_url;
    }
    
    return '/api/placeholder/32/32';
  };


  const startAuction = async () => {
  try {
    const minBid = ethers.parseEther("0.1"); // Default 0.1 ETH
    const duration = 600; // 10 minutes in seconds

    const tx = await contract.startAuction(nft.token_id, minBid, duration);
    await tx.wait();

    toast.success("Auction started!");
    window.location.reload();
  } catch (err) {
    console.error("Start auction failed:", err);
    toast.error("Failed to start auction: " + err.message);
  }
};

const placeBid = async () => {
  try {
    const value = ethers.parseEther(bidAmount);
    const tx = await contract.placeBid(nft.token_id, { value });
    await tx.wait();
    toast.success('Bid placed!');
    window.location.reload();
  } catch (err) {
    toast.error('Failed to place bid: ' + err.message);
  }
};

const endAuction = async () => {
  try {
    const tx = await contract.endAuction(nft.token_id);
    await tx.wait();
    toast.success('Auction ended');
    window.location.reload();
  } catch (err) {
    toast.error('Failed to end auction: ' + err.message);
  }
};

const withdrawBid = async () => {
  try {
    const tx = await contract.withdrawBid(nft.token_id);
    await tx.wait();
    toast.success('Refund withdrawn');
    window.location.reload();
  } catch (err) {
    toast.error('Withdraw failed: ' + err.message);
  }
};

  if (isLoading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-green-500' : 'border-green-600'}`}></div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">NFT Not Found</h2>
          <p className="mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/marketplace" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/marketplace" 
          className={`inline-flex items-center mb-6 px-4 py-2 rounded-lg ${
            darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors`}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Marketplace
        </Link>

        {/* NFT Detail Card */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2">
              <img 
                src={nft.image_url || '/api/placeholder/600/600'} 
                alt={nft.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{nft.title}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <img 
                        src={getCreatorAvatar()} 
                        alt={getCreatorDisplayName()} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Created by {getCreatorDisplayName()}
                      </span>
                    </div>
                  </div>
                  {onChainData?.owner && (
                    <div className="flex items-center mb-2">
                      <User size={16} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Owned by: {onChainData.owner.substring(0, 6)}...{onChainData.owner.substring(38)}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  {nft.category}
                </span>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Current Price</span>
                  <span className="text-2xl font-bold text-green-600">
                    {onChainData?.price 
                      ? `${ethers.formatEther(onChainData.price)} ETH` 
                      : `${nft.price} ETH`}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {nft.description || 'No description available for this NFT.'}
                </p>
              </div>
              
              {!account && (
                <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex flex-col items-center space-y-3">
                    <Wallet size={24} className="text-green-500" />
                    <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Connect your wallet to see real-time blockchain data and make transactions
                    </p>
                    <button 
                      onClick={connectWallet}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              )}
              
              {account && !isCorrectNetwork && (
                <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-yellow-900 bg-opacity-50' : 'bg-yellow-100'}`}>
                  <div className="flex flex-col items-center space-y-3">
                    <p className={`text-center ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      Please switch to the correct network to interact with this NFT
                    </p>
                    <button 
                      onClick={switchNetwork}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Switch Network
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Properties</h3>
                <div className="grid grid-cols-2 gap-3">
                  {nft.properties ? (
                    Object.entries(nft.properties).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`p-3 rounded-lg text-center ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <p className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))
                  ) : (
                    <p className={`col-span-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No properties available
                    </p>
                  )}
                </div>
              </div>

              {(nft.for_sale || (onChainData?.isListed)) && account && isCorrectNetwork && (
                // <button 
                //   onClick={async () => {
                //     try {
                //       // Handle buying the NFT
                //       const tokenId = nft.token_id;
                //       const price = onChainData?.price || ethers.parseEther(nft.price.toString());
                      
                //       toast.info("Please confirm the transaction in your wallet");
                      
                //       const tx = await contract.buyToken(tokenId, {
                //         value: price
                //       });
                      
                //       toast.info("Transaction submitted! Waiting for confirmation...");
                      
                //       // Wait for transaction to be mined
                //       await tx.wait();
                      
                //       toast.success("NFT purchased successfully!");
                      
                //       // Reload on-chain data
                //       window.location.reload();
                //     } catch (error) {
                //       console.error("Error buying NFT:", error);
                //       toast.error("Failed to purchase NFT: " + error.message);
                //     }
                //   }}
                //   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                // >
                //   Buy Now for {onChainData?.price 
                //     ? `${ethers.formatEther(onChainData.price)} ETH` 
                //     : `${nft.price} ETH`}
                // </button>
                <button 
                onClick={async () => {
                  try {
                    const tokenId = nft.token_id;
                    const price = onChainData?.price || ethers.parseEther(nft.price.toString());

                    toast.info("Please confirm the transaction in your wallet");

                    //  Call correct function from contract
                    const tx = await contract.buyNFT(tokenId, {
                      value: price
                    });

                    toast.info("Transaction submitted! Waiting for confirmation...");

                    await tx.wait();

                    toast.success("NFT purchased successfully!");

                    window.location.reload();
                  } catch (error) {
                    console.error("Error buying NFT:", error);
                    toast.error("Failed to purchase NFT: " + error.message);
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                Buy Now for {onChainData?.price 
                  ? `${ethers.formatEther(onChainData.price)} ETH` 
                  : `${nft.price} ETH`}
              </button>

              )}
              {account?.toLowerCase() === onChainData?.owner?.toLowerCase() && !auction?.active && (
                <button
                  onClick={startAuction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 mb-4"
                >
                  Start Auction (0.1 ETH / 10 min)
                </button>
              )}

              {onChainData?.isListed === false && contract && nft?.token_id && (
              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-semibold mb-2">Auction</h3>

                <div className="mb-3 text-sm">
                  <p>Highest Bid: {ethers.formatEther(auction?.highestBid || '0')} ETH</p>
                  <p>Highest Bidder: {auction?.highestBidder?.slice(0, 6)}...{auction?.highestBidder?.slice(-4)}</p>
                  <p>Auction Ends: {auction?.endTime ? new Date(Number(auction.endTime) * 1000).toLocaleString() : '--'}</p>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="number"
                    placeholder="Your bid in ETH"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="border px-3 py-2 rounded-lg w-full"
                  />
                  <button
                    onClick={placeBid}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Place Bid
                  </button>
                </div>

                {account?.toLowerCase() === auction?.seller?.toLowerCase() && (
                  <button
                    onClick={endAuction}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    End Auction
                  </button>
                )}

                {bidsRefundable && (
                  <button
                    onClick={withdrawBid}
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Withdraw Previous Bid
                  </button>
                )}
              </div>
            )}

            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className={`mt-8 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Event</th>
                      <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Price</th>
                      <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>From</th>
                      <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>To</th>
                      <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date</th>
                    </tr>
                  </thead>
                  {/* <tbody>
                    {transactions.map((tx) => (
                      <tr 
                        key={tx.id}
                        className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-4 flex items-center">
                          {tx.type === 'sale' ? (
                            <Tag size={16} className="mr-2 text-green-500" />
                          ) : (
                            <Clock size={16} className="mr-2 text-blue-500" />
                          )}
                          <span>{tx.type === 'sale' ? 'Sale' : 'Listing'}</span>
                        </td>
                        <td className="px-4 py-4 font-medium">{tx.price} ETH</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img 
                              src={tx.seller?.avatar_url || '/api/placeholder/24/24'} 
                              alt={tx.seller?.username || 'Seller'} 
                              className="w-5 h-5 rounded-full mr-2"
                            />
                            <span>{tx.seller?.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {tx.type === 'sale' ? (
                            <div className="flex items-center">
                              <img 
                                src={tx.buyer?.avatar_url || '/api/placeholder/24/24'} 
                                alt={tx.buyer?.username || 'Buyer'} 
                                className="w-5 h-5 rounded-full mr-2"
                              />
                              <span>{tx.buyer?.username || 'Unknown'}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">--</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">{formatDate(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody> */}
                  <tbody>
                  {transactions.map((tx, index) => (
                    <tr
                      key={index}
                      className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-4 flex items-center">
                        {tx.type === 'sale' ? (
                          <Tag size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Clock size={16} className="mr-2 text-blue-500" />
                        )}
                        <span className="capitalize">{tx.type}</span>
                      </td>
                      <td className="px-4 py-4 font-medium">{tx.price} ETH</td>
                      <td className="px-4 py-4 text-sm">
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </td>
                      <td className="px-4 py-4 text-sm">{formatDate(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>

                </table>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock size={36} className="mx-auto mb-3" />
                <p>No transaction history available for this NFT.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;