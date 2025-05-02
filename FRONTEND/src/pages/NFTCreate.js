import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PINATA_GATEWAY } from '../config';

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
  const [royaltyPercentage, setRoyaltyPercentage] = useState('10'); // Default 10%
  const navigate = useNavigate();

  // Get Web3 context
  const { account, contract, isCorrectNetwork, connectWallet, switchNetwork } = useWeb3();

  // Get the current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Basic validation for image files
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid image file');
      setFile(null);
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

  // Modified saveToSupabase function to handle the missing column
  const saveToSupabase = async (nftData) => {
    try {
      // Remove the blockchain_status field if it's causing issues
      const { blockchain_status, ...filteredData } = nftData;
      
      // Add a status field instead (assuming this column exists)
      const dataToInsert = {
        ...filteredData,
        status: blockchain_status // Use a column that actually exists in your table
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
      // Get the listing fee from the contract
      const listingFee = await contract.getListingPrice();
      
      // Convert royalty percentage to basis points (e.g., 10% -> 1000 basis points)
      const royaltyBasisPoints = parseInt(royaltyPercentage) * 100;
      
      setTxStatus('Minting NFT...');
      // Call the mintNFT function with listing fee as value
      const tx = await contract.mintNFT(
        tokenURI,                // Metadata URI
        account,                 // Royalty receiver (current user)
        royaltyBasisPoints,      // Royalty fee in basis points
        { value: listingFee }    // Pay the listing fee
      );
      
      setTxStatus('Waiting for transaction confirmation...');
      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      
      // Find the NFTMinted event to get the tokenId
      const event = receipt.logs
        .filter(log => log.fragment && log.fragment.name === 'NFTMinted')
        .map(log => log.args);
      
      if (event && event.length > 0) {
        const tokenId = event[0].tokenId;
        
        // If price is set, list the NFT for sale
        if (priceInEth && priceInEth > 0) {
          setTxStatus('Listing NFT for sale...');
          // Convert ETH price to wei
          const priceInWei = ethers.parseEther(priceInEth.toString());
          
          // List the NFT for sale
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if wallet is connected and on the correct network
    if (!account) {
      try {
        await connectWallet();
        return; // Return early to let the connect effect happen
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
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
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
      
      // Mint NFT on the blockchain (but don't list for sale)
      const tokenId = await mintNFTOnChain(metadataUrl, 0);
      
      // Save metadata to Supabase
      const nftData = {
        title,
        category,
        description,
        price: 0, // Not for sale
        image_url: imageUrl,
        metadata_url: metadataUrl,
        ipfs_hash: ipfsHash,
        metadata_hash: metadataHash,
        creator_id: userId,
        owner_id: userId,
        created_at: new Date(),
        token_id: tokenId,
        contract_address: contract.target,
        blockchain_status: 'minted', // This field will be handled in saveToSupabase
        for_sale: false,
        royalty_percentage: parseInt(royaltyPercentage)
      };
      
      await saveToSupabase(nftData);
      
      // Success!
      setSuccessMessage("NFT created and minted successfully!");
      setTimeout(() => navigate('/nft-hub'), 2000);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while creating the NFT');
    } finally {
      setIsLoading(false);
      setTxStatus('');
    }
  };

  const handleSaveAndSell = async (e) => {
    e.preventDefault();
    
    // Check if wallet is connected and on the correct network
    if (!account) {
      try {
        await connectWallet();
        return; // Return early to let the connect effect happen
      } catch (error) {
        setErrorMessage("Please connect your wallet to continue");
        return;
      }
    }
    
    if (!isCorrectNetwork) {
      setErrorMessage("Please switch to the correct network");
      await switchNetwork();
      return;
    }
    
    if (!file) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setErrorMessage('Please enter a valid price');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
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
      
      // Mint NFT on the blockchain and list for sale
      const tokenId = await mintNFTOnChain(metadataUrl, price);
      
      // Save metadata to Supabase
      const nftData = {
        title,
        category,
        description,
        price: parseFloat(price),
        image_url: imageUrl,
        metadata_url: metadataUrl,
        ipfs_hash: ipfsHash,
        metadata_hash: metadataHash,
        creator_id: userId,
        owner_id: userId,
        created_at: new Date(),
        token_id: tokenId,
        contract_address: contract.target,
        blockchain_status: 'listed', // This field will be handled in saveToSupabase
        for_sale: true,
        royalty_percentage: parseInt(royaltyPercentage)
      };
      
      await saveToSupabase(nftData);
      
      // Success!
      setSuccessMessage("NFT created, minted and listed for sale successfully!");
      setTimeout(() => navigate('/nft-hub'), 2000);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while creating the NFT');
    } finally {
      setIsLoading(false);
      setTxStatus('');
    }
  };

  const handleCancel = () => {
    navigate('/nft-hub');
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
        
        {txStatus && (
          <div className="card-panel blue lighten-4 blue-text text-darken-4">
            <div className="progress">
              <div className="indeterminate"></div>
            </div>
            <p><i className="material-icons left">sync</i> {txStatus}</p>
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
                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} 
              />
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
              className="btn green darken-2" 
              style={{ marginRight: '10px' }}
              disabled={isLoading}
            >
              <i className="material-icons left">save</i> Mint NFT
              {isLoading && <span className="spinner"></span>}
            </button>
            <button 
              type="button" 
              className="btn blue darken-2"
              onClick={handleSaveAndSell}
              disabled={isLoading}
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