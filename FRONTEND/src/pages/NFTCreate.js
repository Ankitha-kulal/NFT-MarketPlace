import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NFTCreate = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, category, description, price, file });
    navigate('/nft-hub');
  };

  const handleCancel = () => {
    navigate('/nft-hub'); // Redirect to the NFT Hub page
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '20px', borderRadius: '20px', maxWidth: '600px', width: '100%' }}>
        <h4 className="black-text center" style={{ fontWeight: 'bold' }}>
          <i className="material-icons left">add_a_photo</i> Create NFT
        </h4>
        
        <form onSubmit={handleSubmit}>
          <div className="file-field input-field">
            <div className="btn blue darken-2">
              <span><i className="material-icons left">file_upload</i> Select File</span>
              <input type="file" onChange={handleFileChange} required />
            </div>
            <div className="file-path-wrapper">
              <input className="file-path validate" type="text" placeholder="Upload NFT image" />
            </div>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">title</i>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label>Title</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">category</i>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <label>Category</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">description</i>
            <textarea className="materialize-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            <label>Description</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix">attach_money</i>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <label>Price (ETH)</label>
          </div>

          <div className="row center">
            <button type="submit" className="btn green darken-2" style={{ marginRight: '10px' }}>
              <i className="material-icons left">save</i> Save
            </button>
            <button type="submit" className="btn blue darken-2">
              <i className="material-icons left">sell</i> Save & Sell
            </button>
            <button type="button" onClick={handleCancel} className="btn red darken-2" style={{ marginLeft: '10px' }}>
              <i className="material-icons left">cancel</i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NFTCreate;
