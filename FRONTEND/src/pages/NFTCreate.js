import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PINATA_GATEWAY } from '../config';
import CryptoJS from 'crypto-js'; // You'll need to install: npm install crypto-js

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

  // Function to generate image hash
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

  // Function to check for duplicate images
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
      
      // Generate hash and check for duplicates
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
    // Block minting if duplicate is detected
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
      
      // Generate image hash for storage
      const imageHash = await generateImageHash(file);
      
      // Upload image to IPFS via Pinata
      setTxStatus('Uploading image to IPFS...');
      const ipfsHash = await uploadToPinata(file);
      const imageUrl = `${PINATA_GATEWAY}${ipfsHash}`;
      
      // Create and upload metadata
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
      
      // Mint NFT on the blockchain
      const tokenId = await mintNFTOnChain(metadataUrl, listForSale ? price : 0);
      
      // Save metadata to Supabase with image hash
      const nftData = {
        title,
        category,
        description,
        price: listForSale ? parseFloat(price) : 0,
        image_url: imageUrl,
        metadata_url: metadataUrl,
        ipfs_hash: ipfsHash,
        metadata_hash: metadataHash,
        image_hash: imageHash, // Store the image hash for duplicate detection
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

  // Display wallet connection button if not connected
  if (!account) {
    return (
      <div className="container center-align" style={{ marginTop: '50px' }}>
        <div className="card z-depth-3" style={{ padding: '20px', borderRadius: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <h4 className="black-text">Connect Wallet</h4>
          <p>Please connect your wallet to create an NFT</p>
          <button 
            className="btn blue darken-2 waves-effect waves-light"
            onClick={connectWallet}
          >
            <i className="material-icons left">account_balance_wallet</i>
            Connect Wallet
          </button>
          {errorMessage && (
            <div className="card-panel red lighten-4 red-text text-darken-4 mt-3">
              <i className="material-icons left">error</i> {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Display network switch button if on wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="container center-align" style={{ marginTop: '50px' }}>
        <div className="card z-depth-3" style={{ padding: '20px', borderRadius: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <h4 className="black-text">Wrong Network</h4>
          <p>Please switch to the Sepolia test network to continue</p>
          <button 
            className="btn orange darken-2 waves-effect waves-light"
            onClick={switchNetwork}
          >
            <i className="material-icons left">swap_horiz</i>
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="black-text container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '20px', borderRadius: '20px', maxWidth: '600px', width: '100%' }}>
        <h4 className="black-text center" style={{ fontWeight: 'bold' }}>
          <i className="material-icons left">add_a_photo</i> Create NFT
        </h4>
        
        {errorMessage && (
          <div className="card-panel red lighten-4 red-text text-darken-4">
            <i className="material-icons left">error</i> {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="card-panel green lighten-4 green-text text-darken-4">
            <i className="material-icons left">check_circle</i> {successMessage}
          </div>
        )}
        
        {(txStatus || isDuplicateCheckLoading) && (
          <div className="card-panel blue lighten-4 blue-text text-darken-4">
            <div className="progress">
              <div className="indeterminate"></div>
            </div>
            <p><i className="material-icons left">sync</i> {txStatus || 'Checking for duplicates...'}</p>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateNFT && (
          <div className="card-panel orange lighten-4 orange-text text-darken-4">
            <h6><i className="material-icons left">warning</i> Duplicate NFT Detected!</h6>
            <p><strong>This image already exists as:</strong></p>
            <p>• Title: {duplicateNFT.title}</p>
            <p>• Token ID: {duplicateNFT.token_id}</p>
            <p>• Category: {duplicateNFT.category}</p>
            <p><strong>NFTs must be unique. Please select a different image.</strong></p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="file-field input-field">
            <div className="btn blue darken-2">
              <span><i className="material-icons left">file_upload</i> Select File</span>
              <input type="file" accept="image/*" onChange={handleFileChange} required />
            </div>
            <div className="file-path-wrapper">
              <input className="file-path validate" type="text" placeholder="Upload NFT image" />
            </div>
          </div>

          {file && (
            <div className="center-align" style={{ marginBottom: '20px' }}>
              <img 
                src={URL.createObjectURL(file)} 
                alt="NFT Preview" 
                style={{ 
                  maxHeight: '200px', 
                  maxWidth: '100%', 
                  objectFit: 'contain',
                  border: duplicateNFT ? '3px solid #ff9800' : '3px solid #4caf50',
                  borderRadius: '8px'
                }} 
              />
              {duplicateNFT && (
                <p className="red-text" style={{ marginTop: '10px' }}>
                  <i className="material-icons tiny">warning</i> This image is a duplicate
                </p>
              )}
            </div>
          )}

          <div className="input-field">
            <i className="material-icons prefix">title</i>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label className={title ? "active" : ""}>Title</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">category</i>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <label className={category ? "active" : ""}>Category</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">description</i>
            <textarea 
              className="materialize-textarea" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required
            ></textarea>
            <label className={description ? "active" : ""}>Description</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">attach_money</i>
            <input 
              type="number" 
              step="0.001" 
              min="0" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
            />
            <label className={price ? "active" : ""}>Price (ETH)</label>
          </div>
          
          <div className="input-field">
            <i className="material-icons prefix">copyright</i>
            <input 
              type="number" 
              step="1" 
              min="0" 
              max="30"
              value={royaltyPercentage} 
              onChange={(e) => setRoyaltyPercentage(e.target.value)} 
              required 
            />
            <label className={royaltyPercentage ? "active" : ""}>Royalty Percentage (%)</label>
          </div>

          <div className="row center">
            <button 
              type="submit" 
              className={`btn ${duplicateNFT ? 'grey' : 'green darken-2'}`}
              style={{ marginRight: '10px' }}
              disabled={isLoading || duplicateNFT || isDuplicateCheckLoading}
            >
              <i className="material-icons left">save</i> Mint NFT
              {isLoading && <span className="spinner"></span>}
            </button>
            <button 
              type="button" 
              className={`btn ${duplicateNFT ? 'grey' : 'blue darken-2'}`}
              onClick={handleSaveAndSell}
              disabled={isLoading || duplicateNFT || isDuplicateCheckLoading}
              style={{ marginRight: '10px' }}
            >
              <i className="material-icons left">sell</i> Mint & List for Sale
              {isLoading && <span className="spinner"></span>}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn red darken-2"
            >
              <i className="material-icons left">cancel</i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NFTCreate;