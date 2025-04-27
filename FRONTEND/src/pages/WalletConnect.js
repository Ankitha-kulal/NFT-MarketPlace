import React from 'react';

const WalletConnect = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h3>Connect Your Wallet</h3>
      {/* 3D Card Container */}
      <div className="unique-card-3d-container">
        <div className="unique-card-3d">
          <button className="unique-connect-btn">
            <img
              src="/images/metamask.png"  // Ensure you have the MetaMask fox image here
              alt="MetaMask"
              style={{ width: '150px', marginRight: '15px' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;