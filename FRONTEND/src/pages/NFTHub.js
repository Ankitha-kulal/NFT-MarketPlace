import React from 'react';
import { Link } from 'react-router-dom';

const NFTHub = () => {
  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <h3 style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>NFT Hub</h3>
      <p style={{ color: 'black', textAlign: 'center' }}>All things NFT in one place.</p>
      
      {/* Create & Sell New NFT */}
      <div className="center-align" style={{ marginBottom: '20px' }}>
        <Link to="/nft-create" className="btn blue darken-3" style={{ color: 'white' }}>Create & Sell New NFT</Link>
      </div>
      
      {/* NFT Cards */}
      <div className="row">
        {/* NFT 1 */}
        <div className="col s12 m4">
          <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
            <div className="card-image">
              <img src="/images/nft1.jpg" alt="NFT 1" />
            </div>
            <div className="card-content">
              <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 1</h6>
              <p style={{ color: 'black' }}>Status: Owned</p>
              <p style={{ color: 'black' }}>Price: 0.1 ETH</p>
              <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
            </div>
          </div>
        </div>
        
        {/* NFT 2 */}
        <div className="col s12 m4">
          <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
            <div className="card-image">
              <img src="/images/nft2.jpg" alt="NFT 2" />
            </div>
            <div className="card-content">
              <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 2</h6>
              <p style={{ color: 'black' }}>Status: For Sale</p>
              <p style={{ color: 'black' }}>Price: 0.2 ETH</p>
              <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
            </div>
          </div>
        </div>
        
        {/* NFT 3 */}
        <div className="col s12 m4">
          <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
            <div className="card-image">
              <img src="/images/nft3.jpg" alt="NFT 3" />
            </div>
            <div className="card-content">
              <h6 style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Artwork 3</h6>
              <p style={{ color: 'black' }}>Status: Owned</p>
              <p style={{ color: 'black' }}>Price: 0.15 ETH</p>
              <button className="btn red darken-3" style={{ width: '100%' }}>Sell</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTHub;
