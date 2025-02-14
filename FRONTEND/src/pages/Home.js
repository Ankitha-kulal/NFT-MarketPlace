import React from 'react';

const Home = () => {
  return (
    <center>
      <div className="container center-container">
        <br/>
        <img src="/images/nft-banner.jpg" alt="NFT Banner" className="responsive-img" width="600" height="300" />
        <h3>Welcome to NFT Platform</h3>
        <p>Explore the marketplace and manage your NFTs easily.</p>
        <button className="btn blue darken-3">Get Started</button>
      </div>
    </center>
  );
};

export default Home;