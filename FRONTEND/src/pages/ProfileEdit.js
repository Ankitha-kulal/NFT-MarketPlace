import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <div className="bg-gray-100 min-h-screen pt-12 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-64 md:h-80">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute top-4 right-4">
              <label className="cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 text-green-800 p-2 rounded-full shadow-md transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverImageChange} 
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 pt-20 pb-12 md:flex md:flex-col md:items-center">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <label className="absolute bottom-2 right-0 cursor-pointer bg-green-800 hover:bg-green-700 text-white p-2 rounded-full shadow-md transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageChange} 
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* User Identity Section */}
            <div className="text-center mb-8">
              <input 
                type="text" 
                value={name} 
                onChange={handleInputChange(setName)} 
                className="text-2xl font-bold text-gray-800 mb-1 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none transition-all px-2"
              />
              <div className="h-1"></div>
              <input 
                type="text" 
                value={title} 
                onChange={handleInputChange(setTitle)} 
                className="text-lg text-gray-600 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none transition-all px-2"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition-all">
                <div className="bg-green-800 text-white p-3 rounded-lg mr-4">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={handleInputChange(setEmail)} 
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all" 
                  />
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition-all">
                <div className="bg-green-800 text-white p-3 rounded-lg mr-4">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                    <line x1="6" y1="12" x2="18" y2="12"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <input 
                    type="text" 
                    value={walletAddress} 
                    onChange={handleInputChange(setWalletAddress)} 
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="w-full max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">About Me</h3>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <textarea 
                  value={bio} 
                  onChange={handleInputChange(setBio)} 
                  className="w-full bg-transparent border border-gray-200 hover:border-gray-300 focus:border-green-600 focus:outline-none rounded-lg p-3 min-h-32 text-gray-700 transition-all resize-y" 
                />
              </div>
            </div>

            {/* Social Media & Actions */}
            <div className="w-full max-w-2xl mx-auto mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Social Media */}
                <div className="flex space-x-3 mb-6 md:mb-0">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-green-800 hover:bg-green-700 text-white p-3 rounded-full shadow-md transition-all">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-green-800 hover:bg-green-700 text-white p-3 rounded-full shadow-md transition-all">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-green-800 hover:bg-green-700 text-white p-3 rounded-full shadow-md transition-all">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-green-800 hover:bg-green-700 text-white p-3 rounded-full shadow-md transition-all">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link to="/ProfileEdit" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition-all">
                    Edit Profile
                  </Link>
                  <button className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Collection Preview */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">My NFT Collection</h2>
            <Link to="/nft-collection" className="text-green-800 hover:text-green-700 font-medium flex items-center">
              View All
              <svg className="ml-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Sample NFT Cards - Replace with actual data */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="h-48 bg-gray-200">
                  <img src={`/images/nft-sample-${item}.jpg`} alt="NFT" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800">NFT Collection #{item}</h3>
                  <p className="text-sm text-gray-600 mt-1">Created on April 13, 2025</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-green-800 font-medium">0.05 ETH</span>
                    <button className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;