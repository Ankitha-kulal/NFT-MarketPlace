import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PINATA_GATEWAY } from '../config';
import CryptoJS from 'crypto-js';

const NFTCreate = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [txStatus, setTxStatus] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('10');
  const [isDuplicateCheckLoading, setIsDuplicateCheckLoading] = useState(false);
  const [duplicateNFT, setDuplicateNFT] = useState(null);
  const navigate = useNavigate();

  const { account, contract, isCorrectNetwork, connectWallet, switchNetwork } = useWeb3();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const generateImageHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const checkForDuplicates = async (imageHash) => {
    try {
      setIsDuplicateCheckLoading(true);
      setTxStatus('Checking for duplicate images...');
      
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('image_hash', imageHash);
      
      if (error) throw error;
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      throw new Error("Failed to check for duplicate images");
    } finally {
      setIsDuplicateCheckLoading(false);
      setTxStatus('');
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setDuplicateNFT(null);
      return;
    }
    
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      setFile(null);
      setDuplicateNFT(null);
      return;
    }
    
    try {
      setErrorMessage('');
      setFile(selectedFile);
      
      const imageHash = await generateImageHash(selectedFile);
      const duplicate = await checkForDuplicates(imageHash);
      
      if (duplicate) {
        setDuplicateNFT(duplicate);
        setErrorMessage(`⚠️ DUPLICATE DETECTED: This image already exists as NFT "${duplicate.title}" (Token ID: ${duplicate.token_id})`);
      } else {
        setDuplicateNFT(null);
        setSuccessMessage('✅ Image is unique and ready for minting!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Error checking for duplicates: ' + error.message);
      setFile(null);
      setDuplicateNFT(null);
    }
  };

  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
      const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;
      
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey,
          }
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      throw new Error("Failed to upload image to IPFS");
    }
  };

  const uploadMetadataToPinata = async (metadata) => {
    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
            'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
          }
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      throw new Error("Failed to upload metadata to IPFS");
    }
  };

  const saveToSupabase = async (nftData) => {
    try {
      const { blockchain_status, ...filteredData } = nftData;
      
      const dataToInsert = {
        ...filteredData,
        status: blockchain_status
      };
      
      const { data, error } = await supabase
        .from('nfts')
        .insert([dataToInsert])
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      throw new Error(`Failed to save NFT data: ${error.message}`);
    }
  };

  const mintNFTOnChain = async (tokenURI, priceInEth) => {
    try {
      setTxStatus('Getting listing fee...');
      const listingFee = await contract.getListingPrice();
      
      const royaltyBasisPoints = parseInt(royaltyPercentage) * 100;
      
      setTxStatus('Minting NFT...');
      const tx = await contract.mintNFT(
        tokenURI,
        account,
        royaltyBasisPoints,
        { value: listingFee }
      );
      
      setTxStatus('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      const event = receipt.logs
        .filter(log => log.fragment && log.fragment.name === 'NFTMinted')
        .map(log => log.args);
      
      if (event && event.length > 0) {
        const tokenId = event[0].tokenId;
        
        if (priceInEth && priceInEth > 0) {
          setTxStatus('Listing NFT for sale...');
          const priceInWei = ethers.parseEther(priceInEth.toString());
          const listTx = await contract.listNFT(tokenId, priceInWei);
          await listTx.wait();
        }
        
        setTxStatus('');
        return tokenId.toString();
      } else {
        throw new Error("Failed to get token ID from transaction");
      }
    } catch (error) {
      console.error("Error minting NFT on blockchain:", error);
      setTxStatus('');
      throw new Error(`Blockchain error: ${error.message}`);
    }
  };

  const proceedWithMinting = async (listForSale = false) => {
    if (duplicateNFT) {
      setErrorMessage('❌ Cannot mint duplicate NFT. This image already exists on the blockchain!');
      return;
    }

    if (!account) {
      try {
        await connectWallet();
        return;
      } catch (error) {
        setErrorMessage("Please connect your wallet to continue");
        return;
      }
    }
    
    if (!isCorrectNetwork) {
      setErrorMessage("Please switch to the correct network to continue");
      return;
    }
    
    if (!file) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    if (listForSale && (!price || parseFloat(price) <= 0)) {
      setErrorMessage('Please enter a valid price for listing');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const imageHash = await generateImageHash(file);
      
      setTxStatus('Uploading image to IPFS...');
      const ipfsHash = await uploadToPinata(file);
      const imageUrl = `${PINATA_GATEWAY}${ipfsHash}`;
      
      setTxStatus('Creating NFT metadata...');
      const metadata = {
        name: title,
        description: description,
        image: imageUrl,
        attributes: [
          { trait_type: "Category", value: category }
        ]
      };
      
      const metadataHash = await uploadMetadataToPinata(metadata);
      const metadataUrl = `${PINATA_GATEWAY}${metadataHash}`;
      
      const tokenId = await mintNFTOnChain(metadataUrl, listForSale ? price : 0);
      
      const nftData = {
        title,
        category,
        description,
        price: listForSale ? parseFloat(price) : 0,
        image_url: imageUrl,
        metadata_url: metadataUrl,
        ipfs_hash: ipfsHash,
        metadata_hash: metadataHash,
        image_hash: imageHash,
        creator_id: userId,
        owner_id: userId,
        created_at: new Date(),
        token_id: tokenId,
        contract_address: contract.target,
        blockchain_status: listForSale ? 'listed' : 'minted',
        for_sale: listForSale,
        royalty_percentage: parseInt(royaltyPercentage)
      };
      
      await saveToSupabase(nftData);
      
      setSuccessMessage(listForSale ? 
        "NFT created, minted and listed for sale successfully!" : 
        "NFT created and minted successfully!"
      );
      setTimeout(() => navigate('/Marketplace'), 2000);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while creating the NFT');
    } finally {
      setIsLoading(false);
      setTxStatus('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await proceedWithMinting(false);
  };

  const handleSaveAndSell = async (e) => {
    e.preventDefault();
    await proceedWithMinting(true);
  };

  const handleCancel = () => {
    navigate('/Marketplace');
  };

  // Wallet connection screen
  if (!account) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px'
          }}>
            👛
          </div>
          <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px', fontSize: '16px' }}>
            Connect your Web3 wallet to start creating and minting NFTs
          </p>
          <button 
            onClick={connectWallet}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            Connect Wallet
          </button>
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              color: '#ef4444',
              marginTop: '24px',
              fontSize: '14px'
            }}>
              ⚠️ {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wrong network screen
  if (!isCorrectNetwork) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px'
          }}>
            🔗
          </div>
          <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
            Wrong Network
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px', fontSize: '16px' }}>
            Please switch to the Sepolia test network to continue creating NFTs
          </p>
          <button 
            onClick={switchNetwork}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)';
            }}
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  // Main NFT creation form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '24px 24px 0 0'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}>
                🎨
              </div>
              <h1 style={{ 
                color: '#ffffff', 
                fontSize: '32px', 
                fontWeight: '700',
                margin: '0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Create Your NFT
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px', margin: '8px 0 0' }}>
                Mint unique digital assets on the blockchain
              </p>
            </div>

            {/* Status Messages */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                color: '#ef4444',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                color: '#22c55e',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {(txStatus || isDuplicateCheckLoading) && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                color: '#3b82f6',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>{txStatus || 'Checking for duplicates...'}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {duplicateNFT && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                color: '#f59e0b',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  margin: '0 0 16px', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  Duplicate NFT Detected!
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 12px' }}><strong>This image already exists as:</strong></p>
                  <p style={{ margin: '4px 0' }}>• Title: {duplicateNFT.title}</p>
                  <p style={{ margin: '4px 0' }}>• Token ID: {duplicateNFT.token_id}</p>
                  <p style={{ margin: '4px 0' }}>• Category: {duplicateNFT.category}</p>
                  <p style={{ margin: '12px 0 0', fontWeight: '600' }}>
                    NFTs must be unique. Please select a different image.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* File Upload */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#ffffff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px' 
                }}>
                  Upload Image
                </label>
                <div style={{
                  border: `2px dashed ${file ? (duplicateNFT ? '#f59e0b' : '#22c55e') : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  {file ? (
                    <div>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="NFT Preview" 
                        style={{ 
                          maxHeight: '200px', 
                          maxWidth: '100%', 
                          objectFit: 'contain',
                          borderRadius: '12px',
                          border: duplicateNFT ? '3px solid #f59e0b' : '3px solid #22c55e',
                          marginBottom: '16px'
                        }} 
                      />
                      {duplicateNFT && (
                        <p style={{ color: '#f59e0b', fontSize: '14px', margin: '0' }}>
                          ⚠️ This image is a duplicate
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', margin: '0' }}>
                        Click to upload or drag and drop your image
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#ffffff', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px' 
                  }}>
                    Title
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Enter NFT title"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#ffffff', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px' 
                  }}>
                    Category
                  </label>
                  <input 
                    type="text" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="e.g., Art, Photography, Music"
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#ffffff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '8px' 
                }}>
                  Description
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Describe your NFT in detail..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#ffffff', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px' 
                  }}>
                    Price (ETH)
                  </label>
                  <input 
                    type="number" 
                    step="0.001" 
                    min="0" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0.001"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#ffffff', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px' 
                  }}>
                    Royalty Percentage (%)
                  </label>
                  <input 
                    type="number" 
                    step="1" 
                    min="0" 
                    max="30"
                    value={royaltyPercentage} 
                    onChange={(e) => setRoyaltyPercentage(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button 
                  type="submit" 
                  disabled={isLoading || duplicateNFT || isDuplicateCheckLoading}
                  style={{
                    background: duplicateNFT ? 'rgba(107, 114, 128, 0.3)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: duplicateNFT ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    boxShadow: duplicateNFT ? 'none' : '0 10px 25px rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '160px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!duplicateNFT && !isLoading && !isDuplicateCheckLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!duplicateNFT && !isLoading && !isDuplicateCheckLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Minting...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>🎯</span>
                      Mint NFT
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={handleSaveAndSell}
                  disabled={isLoading || duplicateNFT || isDuplicateCheckLoading}
                  style={{
                    background: duplicateNFT ? 'rgba(107, 114, 128, 0.3)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: duplicateNFT ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    boxShadow: duplicateNFT ? 'none' : '0 10px 25px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '200px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!duplicateNFT && !isLoading && !isDuplicateCheckLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!duplicateNFT && !isLoading && !isDuplicateCheckLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>🏪</span>
                      Mint & List for Sale
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={handleCancel} 
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>❌</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default NFTCreate;