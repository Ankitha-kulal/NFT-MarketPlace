import React, { useState } from 'react';
import M from 'materialize-css';

const Profile = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card profile-card z-depth-3" style={{ width: '100%', maxWidth: '800px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
        
        {/* Cover Photo */}
        <div className="card-image" style={{ height: '200px', backgroundImage: 'url(/images/nft-banner.jpg)', backgroundSize: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}></div>

        {/* Profile Info */}
        <div className="card-content" style={{ padding: '20px', textAlign: 'center' }}> {/* Added textAlign: 'center' */}
          {/* Profile 3D Card Effect */}
          <div className="card z-depth-2 profile-details-card" style={{ borderRadius: '10px' }}>
            {/* Profile Picture and Username */}
            <div className="row valign-wrapper" style={{ marginBottom: '15px', justifyContent: 'center', display: 'flex', alignItems: 'center', marginLeft: '252px' }}>
              {/* Profile Image */}
              <div className="col s3" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <img src="/images/logo.png" alt="Profile" className="circle responsive-img" style={{ width: '80px', border: '2px solid #fff' }} />
              </div>

              {/* Name and Title */}
              <div className="col s9" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ marginLeft: '1px' }}>
                  <h5 className="black-text" style={{ fontWeight: 'bold', marginBottom: '5px' }}>JohnDoe</h5>
                  <p className="black-text" style={{ marginBottom: '0px', fontStyle: 'italic' }}>UI/UX Designer</p>
                </div>
              </div>
            </div>



            {/* Email */}
            <div className="row" style={{ marginBottom: '15px', justifyContent: 'center' }}>
              <div className="col s12" style={{ display: 'flex', justifyContent: 'center' }}>
                <p className="black-text">
                   johndoe@example.com
                </p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="row" style={{ marginBottom: '15px', justifyContent: 'center' }}>
              <div className="col s12" style={{ display: 'flex', justifyContent: 'center' }}>
                {/* <p className="black-text">
                  <i className="material-icons left" style={{ color: '#2c3e50' }}>account_balance_wallet</i> 0x123456789abcdef
                </p> */}
                <p className="black-text">
                 account_balance_wallet: 0x123456789abcdef
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="row" style={{ justifyContent: 'center' }}>
              <div className="col s12">
                {/* <p className="black-text" style={{ color: 'black', fontWeight: 'bold' }}>
                  <i className="material-icons left" style={{ color: '#2c3e50', verticalAlign: 'middle' }}>person</i>
                  <strong>Bio:</strong>
                </p> */}
                <p className="black-text" style={{ color: 'black' }}>
                  Passionate UI/UX Designer with a love for creating user-centered designs.
                </p>
                <br />
              </div>
            </div>

            {/* Social Media Links */}
          <div className="row">
            <div className="col s3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn-floating blue darken-3">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
            <div className="col s3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn-floating blue darken-3">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
            <div className="col s3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn-floating pink darken-3">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            <div className="col s3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn-floating blue lighten-2">
                <i className="fab fa-facebook"></i>
              </a>
            </div>
           
          </div>
          <br/>
          </div>

          {/* Search Bar */}
          <div className="input-field" style={{ marginTop: '20px' }}>
            <input 
              type="text" 
              id="search" 
              className="validate" 
              value={searchQuery} 
              onChange={handleSearchChange} 
            />
            <label htmlFor="search">Search for NFT</label>
          </div>

          {/* Purchased NFTs - Grid with 3 Cards */}
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col s12 m4">
              <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
                <div className="card-image">
                  <img src="/images/nft1.jpg" alt="Purchased NFT" />
                </div>
                <div className="card-content">
                  <h6 className="black-text" style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Digital Artwork 1</h6>
                  <p className="black-text" style={{ color: 'black' }}>Status: Purchased</p>
                  <p className="black-text" style={{ color: 'black' }}>Price: 0.089 ETH</p>
                </div>
              </div>
            </div>

            <div className="col s12 m4">
              <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
                <div className="card-image">
                  <img src="/images/nft2.jpg" alt="Purchased NFT" />
                </div>
                <div className="card-content">
                  <h6 className="black-text" style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Digital Artwork 2</h6>
                  <p className="black-text" style={{ color: 'black' }}>Status: Purchased</p>
                  <p className="black-text" style={{ color: 'black' }}>Price: 0.089 ETH</p>
                </div>
              </div>
            </div>

            <div className="col s12 m4">
              <div className="card z-depth-2" style={{ borderRadius: '10px' }}>
                <div className="card-image">
                  <img src="/images/nft3.jpg" alt="Purchased NFT" />
                </div>
                <div className="card-content">
                  <h6 className="black-text" style={{ color: 'black', fontWeight: 'bold' }}>NFT Name: Digital Artwork 3</h6>
                  <p className="black-text" style={{ color: 'black' }}>Status: Purchased</p>
                  <p className="black-text" style={{ color: 'black' }}>Price: 0.089 ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Card Effect Styling */}
        <style jsx>{`
          .profile-card {
            transition: transform 0.3s ease-in-out;
          }

          .profile-card:hover {
            transform: scale(1.05) rotateY(5deg);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          }

          .profile-details-card {
            transition: transform 0.3s ease-in-out;
          }

          .profile-details-card:hover {
            transform: scale(1.05) rotateY(5deg);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          }

          .card-content h6 {
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .card-content p {
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Profile;
