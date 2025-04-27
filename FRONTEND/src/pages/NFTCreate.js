import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NFTCreate = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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

  const saveToSupabase = async (nftData) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .insert([nftData]);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      throw new Error("Failed to save NFT data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Upload image to IPFS via Pinata
      const ipfsHash = await uploadToPinata(file);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Save metadata to Supabase
      const nftData = {
        title,
        category,
        description,
        price: parseFloat(price),
        image_url: ipfsUrl,
        ipfs_hash: ipfsHash,
        created_at: new Date(),
        user_id: supabase.auth.user()?.id // Assuming you have authentication set up
      };
      
      await saveToSupabase(nftData);
      
      // Success! Redirect to NFT hub
      navigate('/nft-hub');
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while creating the NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndSell = async (e) => {
    e.preventDefault();
    // Similar to handleSubmit but with additional flag
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const ipfsHash = await uploadToPinata(file);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      const nftData = {
        title,
        category,
        description,
        price: parseFloat(price),
        image_url: ipfsUrl,
        ipfs_hash: ipfsHash,
        created_at: new Date(),
        user_id: supabase.auth.user()?.id,
        for_sale: true // Additional field to mark it for sale
      };
      
      await saveToSupabase(nftData);
      navigate('/nft-hub');
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while creating the NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/nft-hub');
  };

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

          <div className="row center">
            <button 
              type="submit" 
              className="btn green darken-2" 
              style={{ marginRight: '10px' }}
              disabled={isLoading}
            >
              <i className="material-icons left">save</i> Save
              {isLoading && <span className="spinner"></span>}
            </button>
            <button 
              type="button" 
              className="btn blue darken-2"
              onClick={handleSaveAndSell}
              disabled={isLoading}
            >
              <i className="material-icons left">sell</i> Save & Sell
              {isLoading && <span className="spinner"></span>}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn red darken-2" 
              style={{ marginLeft: '10px' }}
              disabled={isLoading}
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