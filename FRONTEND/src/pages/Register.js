import React, { useEffect, useState } from 'react';
import M from 'materialize-css';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    M.AutoInit();
    
    // Check if MetaMask is installed
    const checkMetaMaskInstalled = () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        setIsMetaMaskInstalled(true);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
          } else {
            setWalletAddress('');
            setIsWalletConnected(false);
          }
        });
        
        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
          .then(accounts => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setIsWalletConnected(true);
            }
          })
          .catch(err => console.error("Error checking existing connection:", err));
      }
    };
    
    checkMetaMaskInstalled();
    
    // Cleanup listener on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      // Open MetaMask download page in a new tab
      window.open('https://metamask.io/download.html', '_blank');
      M.toast({ html: 'MetaMask is not installed. Redirecting to download page.', classes: 'red' });
      return;
    }
    
    try {
      // Using window.ethereum directly instead of creating a provider first
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        M.toast({ html: 'Wallet connected successfully!', classes: 'green' });
      }
    } catch (error) {
      console.error("Connection error:", error);
      M.toast({ html: 'Failed to connect wallet: ' + error.message, classes: 'red' });
    }
  };
  
  const registerWithWallet = async (e) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      M.toast({ html: 'Please connect your wallet first', classes: 'red' });
      return;
    }
    
    if (!username) {
      M.toast({ html: 'Please enter a username', classes: 'red' });
      return;
    }
    
    try {
      // Check if wallet is already registered
      // Note: This should ideally be a server-side check since admin functions
      // are typically not available in client-side code
      // Alternative approach would be to use a custom API endpoint or RLS
      
      // Generate a nonce for the user to sign to prove ownership
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to register your wallet with our NFT marketplace. Nonce: ${nonce}`;
      
      // Ask user to sign the message
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      
      // Create a new user with the wallet address
      const { error } = await supabase.auth.signUp({
        email: `${walletAddress.toLowerCase()}@wallet.auth`, // Use a placeholder email
        password: Math.random().toString(36).slice(2, 10), // Random password
        options: {
          data: {
            username: username,
            wallet_address: walletAddress,
            auth_type: 'wallet',
            is_complete: false
          },
        },
      });
      
      if (error) {
        M.toast({ html: error.message, classes: 'red' });
        return;
      }
      
      // Success - no need to insert into a separate users table
      M.toast({ html: 'Registration successful!', classes: 'green' });
      setTimeout(() => navigate('/complete-profile'), 1000);
      
    } catch (error) {
      console.error(error);
      M.toast({ html: 'Registration failed: ' + error.message, classes: 'red' });
    }
  };

  const registerWithEmail = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      M.toast({ html: 'Passwords do not match!', classes: 'red' });
      return;
    }

    if (password.length < 6) {
      M.toast({ html: 'Password must be at least 6 characters', classes: 'red' });
      return;
    }

    if (!username) {
      M.toast({ html: 'Please enter a username', classes: 'red' });
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect to profile completion page after email verification
          emailRedirectTo: `${window.location.origin}/complete-profile`,
          data: {
            username: username,
            email: email,
            auth_type: 'email',
            is_complete: false
          },
        },
      });

      if (error) {
        M.toast({ html:"Error in registration: "+ error.message, classes: 'red' });
        return;
      }
      
      // Show success message
      M.toast({ 
        html: 'Registration successful! Please check your email to verify your account.', 
        classes: 'green',
        displayLength: 6000
      });

    } catch (error) {
      console.error(error);
      M.toast({ html: 'Registration failed: ' + error.message, classes: 'red' });
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '500px', width: '100%', borderRadius: '10px' }}>
        <h3 className="center-align" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
          Join NFT Marketplace
        </h3>
        <p className="center-align" style={{ color: '#546e7a' }}>
          Create an account to start buying, selling, and collecting NFTs
        </p>

        <div className="divider" style={{ margin: '20px 0' }}></div>
        
        {/* Register with Metamask Section */}
        <div className="row">
          <div className="col s12">
            <div className="card-panel" style={{ borderRadius: '8px', backgroundColor: '#FFFAF0' }}>
              <h5 className="center-align" style={{ color: '#FF8C00', marginTop: '5px' }}>
                Register with MetaMask
              </h5>
              
              <div className="center-align" style={{ marginBottom: '15px', marginTop: '25px' }}>
                <button
                  onClick={connectWallet}
                  className="btn waves-effect waves-light orange darken-2 btn-large"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                    alt="MetaMask Fox"
                    style={{ height: '24px', marginRight: '10px' }}
                  />
                  {isWalletConnected 
                    ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
                    : isMetaMaskInstalled ? 'Connect with MetaMask' : 'Install MetaMask'}
                </button>
              </div>
              
              {isWalletConnected && (
                <form onSubmit={registerWithWallet}>
                  <div className="input-field">
                    <i className="material-icons prefix orange-text">person</i>
                    <input
                      type="text"
                      id="wallet-username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="wallet-username">Choose a Username</label>
                  </div>
                  
                  <div className="center-align" style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <button type="submit" className="btn waves-effect waves-light orange darken-3">
                      Complete Registration with MetaMask
                      <i className="material-icons right">how_to_reg</i>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        
        <div className="center-align" style={{ margin: '15px 0' }}>
          <h6 style={{ color: '#546e7a' }}>- OR -</h6>
        </div>
        
        {/* Register with Email Section */}
        <div className="row">
          <div className="col s12">
            <div className="card-panel" style={{ borderRadius: '8px', backgroundColor: '#F0F8FF' }}>
              <h5 className="center-align" style={{ color: '#1E90FF', marginTop: '5px' }}>
                Register with Email
              </h5>
              
              <form onSubmit={registerWithEmail}>
                <div className="input-field">
                  <i className="material-icons prefix blue-text">person</i>
                  <input
                    type="text"
                    id="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <label htmlFor="username">Username</label>
                </div>

                <div className="input-field">
                  <i className="material-icons prefix blue-text">email</i>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <div className="input-field">
                  <i className="material-icons prefix blue-text">lock</i>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password (min 6 characters)</label>
                </div>

                <div className="input-field">
                  <i className="material-icons prefix blue-text">lock_outline</i>
                  <input
                    type="password"
                    id="confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="confirm-password">Confirm Password</label>
                </div>

                <div className="center-align" style={{ marginTop: '25px', marginBottom: '15px' }}>
                  <button type="submit" className="btn waves-effect waves-light blue darken-3 btn-large" style={{ width: '100%' }}>
                    Register with Email
                    <i className="material-icons right">send</i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="center-align" style={{ marginTop: '20px' }}>
          <p>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;