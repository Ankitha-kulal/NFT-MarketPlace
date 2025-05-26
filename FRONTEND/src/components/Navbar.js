import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch profile when user changes
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
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
    // Close account dropdown if it's open when toggling mobile menu
    if (accountDropdownOpen) setAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center">
            <img src="/images/image.png" alt="Company Logo" className="h-8 mr-3" />

          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none p-2 rounded hover:bg-green-700"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 hover:bg-green-700 rounded transition duration-150">Home</Link>
            
            {/* Show these links only when user is logged in */}
            {user && (
              <>
                <Link to="/Marketplace" className="px-3 py-2 hover:bg-green-700 rounded transition duration-150">Marketplace</Link>
                {/* <Link to="/my-card" className="px-3 py-2 hover:bg-green-700 rounded transition duration-150">Cards</Link> */}
                <Link to="/explore" className="px-3 py-2 hover:bg-green-700 rounded transition duration-150">Explore</Link>
                <Link to="/cart" className="px-3 py-2 hover:bg-green-700 rounded transition duration-150">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </Link>
                
                {/* NFT dropdown menu with Create NFT option */}
                <div className="relative inline-block group">
                  <button className="px-3 py-2 hover:bg-green-700 rounded flex items-center transition duration-150">
                    NFT Hub
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 mt-1 py-2 w-48 bg-white rounded shadow-xl z-20">
                    <Link to="/nft-hub" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">NFT Hub</Link>
                    <Link to="/nft/create" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">Create NFT</Link>
                    <Link to="/nft-collection" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">NFT Collection</Link>
                  </div>
                </div>
              </>
            )}

            {/* User Avatar (when logged in) */}
            {user && (
              <div className="relative inline-block">
                <button 
                  onClick={toggleAccountDropdown}
                  className="flex items-center hover:bg-green-700 rounded focus:outline-none p-1 transition duration-150"
                  aria-label="Account menu"
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
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">My Profile</Link>
                    <Link to="/ProfileEdit" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">Edit Profile</Link>
                    <Link to="/change-password" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">Change Password</Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150"
                    >
                      Logout
                    </button>
                    <Link to="/connect" className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150">Connect Wallet</Link>
                  </div>
                )}
              </div>
            )}

            {/* Login/Register for non-logged in users */}
            {!user && (
              <div className="flex items-center">
                <Link to="/login" className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md transition duration-150 text-sm">
                  Login
                </Link>
                <Link to="/register" className="ml-2 px-3 py-1 bg-white text-green-800 hover:bg-gray-100 rounded-md transition duration-150 text-sm">
                  Sign Up
                </Link>
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
                <div className="flex w-full justify-center">
                  <Link to="/login" className="bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-700 transition duration-150 text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="ml-2 bg-white text-green-800 px-3 py-1 rounded font-medium hover:bg-gray-100 transition duration-150 text-sm">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link to="/" className="block px-3 py-2 hover:bg-green-700 rounded transition duration-150">Home</Link>
            
            {/* Only show these links for logged in users */}
            {user && (
              <>
                <Link to="/Marketplace" className="block px-3 py-2 hover:bg-green-700 rounded transition duration-150">Marketplace</Link>
                <Link to="/my-card" className="block px-3 py-2 hover:bg-green-700 rounded transition duration-150">Cards</Link>
                <Link to="/explore" className="block px-3 py-2 hover:bg-green-700 rounded transition duration-150">Explore</Link>
                <Link to="/cart" className="block px-3 py-2 hover:bg-green-700 rounded flex items-center transition duration-150">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Cart
                </Link>
                
                <div className="border-t border-green-700 my-2"></div>
                
                <div className="px-3 py-2 text-green-300 font-medium">NFT</div>
                <Link to="/nft-hub" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">NFT Hub</Link>
                <Link to="/nft/create" className="block px-6 py-2 hover:bg-green-700 rounded font-semibold transition duration-150">Create NFT</Link>
                <Link to="/nft-collection" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">NFT Collection</Link>
                <Link to="/bid" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">Bid</Link>
                
                <div className="border-t border-green-700 my-2"></div>
                <div className="px-3 py-2 text-green-300 font-medium">My Account</div>
                <Link to="/profile" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">My Profile</Link>
                <Link to="/ProfileEdit" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">Edit Profile</Link>
                <Link to="/reset-password" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">Change Password</Link>
                <Link to="/connect" className="block px-6 py-2 hover:bg-green-700 rounded transition duration-150">Connect Wallet</Link>
                <div className="border-t border-green-700 my-2"></div>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-6 py-2 text-red-400 hover:bg-green-700 rounded flex items-center transition duration-150"
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;