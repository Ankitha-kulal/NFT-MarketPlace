import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nftDropdownOpen, setNftDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch user profile when user changes
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfile(data);
        } else {
          console.error('Error fetching profile:', error);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // Get avatar display - either image or initials
  const getAvatarDisplay = () => {
    if (profile?.avatar_url) {
      return (
        <img 
          src={profile.avatar_url} 
          alt="User Avatar" 
          className="w-full h-full object-cover" 
        />
      );
    } else {
      const displayName = 
        profile?.username || 
        profile?.full_name || 
        user?.user_metadata?.username || 
        user?.email || 
        'U';
      
      const initial = displayName.charAt(0).toUpperCase();
      
      return (
        <div className="flex items-center justify-center w-full h-full bg-green-700 text-white font-bold">
          {initial}
        </div>
      );
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleNftDropdown = () => {
    setNftDropdownOpen(!nftDropdownOpen);
    if (!nftDropdownOpen) setAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
    if (!accountDropdownOpen) setNftDropdownOpen(false);
  };

  const logoutClickHandler = (e) => {
    e.preventDefault();
    console.log('Logout clicked'); // Debug log
    handleLogout();
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center">
            <img src="/images/logo.png" alt="Company Logo" className="h-8 mr-3" />
            <span className="font-bold text-lg">Company Name</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 hover:bg-green-700 rounded">Home</Link>
            <Link to="/Marketplace" className="px-3 py-2 hover:bg-green-700 rounded">Marketplace</Link>
            <Link to="/my-card" className="px-3 py-2 hover:bg-green-700 rounded">Cards</Link>
            <Link to="/explore" className="px-3 py-2 hover:bg-green-700 rounded">Explore</Link>

            <Link to="/cart" className="px-3 py-2 hover:bg-green-700 rounded">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </Link>

            {/* NFT Dropdown */}
            <div className="relative inline-block">
              <button 
                onClick={toggleNftDropdown}
                className="px-3 py-2 hover:bg-green-700 rounded flex items-center"
              >
                NFT
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {nftDropdownOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded shadow-xl z-20">
                  <Link to="/nft-hub" className="block px-4 py-2 text-gray-800 hover:bg-green-100">NFT Hub</Link>
                  <Link to="/nft-create" className="block px-4 py-2 text-gray-800 hover:bg-green-100">NFT Create</Link>
                  <Link to="/nft-collection" className="block px-4 py-2 text-gray-800 hover:bg-green-100">NFT Collection</Link>
                  <Link to="/bid" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Bid</Link>
                </div>
              )}
            </div>

            {/* User Avatar (when logged in) */}
            {user && (
              <div className="relative inline-block">
                <button 
                  onClick={toggleAccountDropdown}
                  className="flex items-center hover:bg-green-700 rounded focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                    {getAvatarDisplay()}
                  </div>
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded shadow-xl z-20">
                    <Link to="/Profile" className="block px-4 py-2 text-gray-800 hover:bg-green-100">My Profile</Link>
                    <Link to="/ProfileEdit" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Edit Profile</Link>
                    <Link to="/change-password" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Change Password</Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                      onClick={logoutClickHandler} 
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-green-100"
                    >
                      Logout
                    </button>
                    <Link to="/connect" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Connect Wallet</Link>
                  </div>
                )}
              </div>
            )}

            {/* Account for non-logged in users */}
            {!user && (
              <div className="relative inline-block">
                <button 
                  onClick={toggleAccountDropdown}
                  className="px-3 py-2 hover:bg-green-700 rounded flex items-center"
                >
                  Account
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded shadow-xl z-20">
                    <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Login</Link>
                    <Link to="/reset-password" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Reset Password</Link>
                    <Link to="/connect" className="block px-4 py-2 text-gray-800 hover:bg-green-100">Connect Wallet</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-green-900">
          {user && (
            <div className="bg-green-800 p-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white mb-3">
                  {getAvatarDisplay()}
                </div>
                <span className="text-white text-center">
                  {profile?.full_name || profile?.username || user?.email}
                </span>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="bg-green-800 p-4">
              <div className="flex flex-col items-center">
                <img src="/images/logo.png" alt="Company Logo" className="h-8 mb-3" />
                <span className="text-white mb-2">Welcome Guest</span>
                <Link to="/login" className="bg-white text-green-800 px-4 py-1 rounded font-medium">
                  Login
                </Link>
              </div>
            </div>
          )}
          
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link to="/" className="block px-3 py-2 hover:bg-green-700 rounded">Home</Link>
            <Link to="/Marketplace" className="block px-3 py-2 hover:bg-green-700 rounded">Marketplace</Link>
            <Link to="/my-card" className="block px-3 py-2 hover:bg-green-700 rounded">Cards</Link>
            <Link to="/explore" className="block px-3 py-2 hover:bg-green-700 rounded">Explore</Link>
            <Link to="/cart" className="block px-3 py-2 hover:bg-green-700 rounded flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Cart
            </Link>
            
            <div className="border-t border-green-700 my-2"></div>
            
            <div className="px-3 py-2 text-green-300 font-medium">NFT</div>
            <Link to="/nft-hub" className="block px-6 py-2 hover:bg-green-700 rounded">NFT Hub</Link>
            <Link to="/nft-create" className="block px-6 py-2 hover:bg-green-700 rounded">NFT Create</Link>
            <Link to="/nft-collection" className="block px-6 py-2 hover:bg-green-700 rounded">NFT Collection</Link>
            <Link to="/bid" className="block px-6 py-2 hover:bg-green-700 rounded">Bid</Link>
            
            {user && (
              <>
                <div className="border-t border-green-700 my-2"></div>
                <div className="px-3 py-2 text-green-300 font-medium">My Account</div>
                <Link to="/Profile" className="block px-6 py-2 hover:bg-green-700 rounded">My Profile</Link>
                <Link to="/ProfileEdit" className="block px-6 py-2 hover:bg-green-700 rounded">Edit Profile</Link>
                <Link to="/change-password" className="block px-6 py-2 hover:bg-green-700 rounded">Change Password</Link>
                <Link to="/connect" className="block px-6 py-2 hover:bg-green-700 rounded">Connect Wallet</Link>
                <div className="border-t border-green-700 my-2"></div>
                <button 
                  onClick={logoutClickHandler} 
                  className="block w-full text-left px-6 py-2 text-red-400 hover:bg-green-700 rounded flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </>
            )}
            
            {!user && (
              <>
                <div className="border-t border-green-700 my-2"></div>
                <div className="px-3 py-2 text-green-300 font-medium">Account</div>
                <Link to="/login" className="block px-6 py-2 hover:bg-green-700 rounded">Login</Link>
                <Link to="/reset-password" className="block px-6 py-2 hover:bg-green-700 rounded">Reset Password</Link>
                <Link to="/connect" className="block px-6 py-2 hover:bg-green-700 rounded">Connect Wallet</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;