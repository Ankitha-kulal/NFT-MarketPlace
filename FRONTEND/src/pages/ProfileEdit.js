import React, { useState } from 'react';
import M from 'materialize-css';

const Profile = () => {
  // State for editable form fields
  const [name, setName] = useState('JohnDoe');
  const [title, setTitle] = useState('UI/UX Designer');
  const [email, setEmail] = useState('johndoe@example.com');
  const [walletAddress, setWalletAddress] = useState('0x123456789abcdef');
  const [bio, setBio] = useState('Passionate UI/UX Designer with a love for creating user-centered designs.');
  const [profileImage, setProfileImage] = useState('/images/logo.png');  // Default profile image
  const [coverImage, setCoverImage] = useState('/images/nft-banner.jpg');  // Default cover image

  // Handle file upload
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle change of inputs
  const handleInputChange = (setter) => (event) => setter(event.target.value);

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card profile-card z-depth-3" style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
        
        {/* Cover Photo */}
        <div 
          className="card-image" 
          style={{
            height: '200px', 
            backgroundImage: `url(${coverImage})`, 
            backgroundSize: 'cover', 
            borderTopLeftRadius: '20px', 
            borderTopRightRadius: '20px'
          }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleCoverImageChange} 
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }} 
          />
        </div>

        {/* Profile Info */}
        <div className="card-content" style={{ padding: '20px' }}>
          {/* Profile Picture and Username */}
          <div className="row valign-wrapper">
            <div className="col s3">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="circle responsive-img" 
                style={{ width: '80px', border: '2px solid #fff' }} 
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfileImageChange} 
                style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }} 
              />
            </div>
            <div className="col s9">
              <input 
                type="text" 
                value={name} 
                onChange={handleInputChange(setName)} 
                style={{ fontWeight: 'bold', color: 'black', fontSize: '1.5rem', border: 'none', backgroundColor: 'transparent' }} 
              />
              <input 
                type="text" 
                value={title} 
                onChange={handleInputChange(setTitle)} 
                style={{ color: 'black', fontSize: '1.2rem', border: 'none', backgroundColor: 'transparent' }} 
              />
            </div>
          </div>

          {/* Email & Wallet Address */}
          <p className="black-text" style={{ color: 'black' }}>
            <i className="material-icons left" style={{ color: '#2c3e50' }}>email</i>
            <input 
              type="email" 
              value={email} 
              onChange={handleInputChange(setEmail)} 
              style={{ border: 'none', backgroundColor: 'transparent' }} 
            />
          </p>
          <p className="black-text" style={{ color: 'black' }}>
            <i className="material-icons left" style={{ color: '#2c3e50' }}>account_balance_wallet</i>
            <input 
              type="text" 
              value={walletAddress} 
              onChange={handleInputChange(setWalletAddress)} 
              style={{ border: 'none', backgroundColor: 'transparent' }} 
            />
          </p>

          {/* Bio */}
          <p className="black-text" style={{ color: 'black' }}>
            <strong>Bio:</strong>
            <textarea 
              value={bio} 
              onChange={handleInputChange(setBio)} 
              style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '100%' }} 
            />
          </p>

          {/* Social Media Links */}
          <div className="row" style={{ marginTop: '20px' }}>
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
            <div className="col s3" style={{ marginTop: '10px' }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn-floating blue lighten-2">
                <i className="fab fa-facebook"></i>
              </a>
            </div>
          </div>
        </div>

        {/* 3D Card Effect */}
        <style jsx>{`
          .profile-card {
            transition: transform 0.3s ease-in-out;
          }

          .profile-card:hover {
            transform: scale(1.05) rotateY(5deg);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Profile;
