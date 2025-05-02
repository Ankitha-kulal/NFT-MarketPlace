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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    M.AutoInit();
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard'); // Redirect to dashboard if already logged in
      }
    };
    
    checkSession();
    
    // Improved check for MetaMask installation
    const checkMetaMaskInstalled = () => {
      if (typeof window !== "undefined") {
        // Check for ethereum provider (more reliable than just window.ethereum)
        // This handles both MetaMask and other web3 wallets
        const provider = window.ethereum || 
                         window.web3?.currentProvider ||
                         (window.web3?.givenProvider || window.ethereum);
        
        if (provider) {
          console.log("Web3 provider detected:", provider);
          setIsMetaMaskInstalled(true);
          
          // Listen for account changes
          provider.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setIsWalletConnected(true);
            } else {
              setWalletAddress('');
              setIsWalletConnected(false);
            }
          });
          // Check if already connected
          provider.request({ method: 'eth_accounts' })
            .then(accounts => {
              console.log("Retrieved accounts:", accounts);
              if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);
              }
            })
            .catch(err => {
              console.error("Error checking existing connection:", err);
              // Even if there's an error checking accounts, we know provider exists
              setIsMetaMaskInstalled(true);
            });
        } else {
          console.log("No Web3 provider detected");
          setIsMetaMaskInstalled(false);
        }
      }
    };
    
    // Run the check once when component mounts
    checkMetaMaskInstalled();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        if (event === 'SIGNED_IN') {
          console.log("User signed in!");
          navigate('/dashboard');
        }
      }
    );
    
    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      // Inform the user to install MetaMask
      M.toast({ html: 'MetaMask is not installed. Redirecting to download page.', classes: 'red' });
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }
    try {
      // Get the provider - handles any Ethereum wallet, not just MetaMask
      const provider = window.ethereum || window.web3?.currentProvider;
      if (!provider) {
        // Fallback message if provider isn't accessible
        M.toast({ html: 'Unable to detect Web3 wallet. Please make sure MetaMask is installed and unlocked.', classes: 'red' });
        return;
      }
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        M.toast({ html: 'Wallet connected successfully!', classes: 'green' });
      }
    } catch (error) {
      console.error("Connection error:", error);
      // More helpful error message
      let errorMessage = error.message || "Unknown error";
      if (errorMessage.includes("User rejected")) {
        errorMessage = "Connection rejected. Please approve the connection in your wallet.";
      }
      M.toast({ html: 'Failed to connect wallet: ' + errorMessage, classes: 'red' });
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
      setLoading(true);
      
      // Check if username is already taken
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (usernameCheckError) {
        console.error("Username check error:", usernameCheckError);
        M.toast({ html: 'Error checking username availability', classes: 'red' });
        setLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        M.toast({ html: 'Username already taken. Please choose another one.', classes: 'red' });
        setLoading(false);
        return;
      }
      
      // Generate a nonce for the user to sign to prove ownership
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to register your wallet with our NFT marketplace. Nonce: ${nonce}`;
      
      // Get the provider - more reliable than directly using window.ethereum
      const provider = window.ethereum || window.web3?.currentProvider;
      
      // Ask user to sign the message
      await provider.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      
      // Create wallet email that won't conflict with existing users
      const walletEmail = `wallet_${walletAddress.toLowerCase().substring(2)}@nft.marketplace`;
      const randomPassword = Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
      
      // Create a new user with the wallet address
      const { data, error } = await supabase.auth.signUp({
        email: walletEmail,
        password: randomPassword,
        options: {
          data: {
            username: username,
            wallet_address: walletAddress,
            auth_type: 'wallet'
          },
        },
      });
      
      if (error) {
        console.error("Wallet signup error:", error);
        M.toast({ html: 'Registration error: ' + error.message, classes: 'red' });
        setLoading(false);
        return;
      }
      
      // Sign in the user immediately after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: randomPassword
      });
      
      if (signInError) {
        console.error("Error signing in after wallet registration:", signInError);
        M.toast({ html: 'Registration successful, but could not log in automatically. Please log in manually.', classes: 'orange' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      // Success
      M.toast({ html: 'Registration successful!', classes: 'green' });
      setTimeout(() => navigate('/dashboard'), 1000);
      
    } catch (error) {
      console.error("Registration error:", error);
      M.toast({ html: 'Registration failed: ' + (error.message || "Unknown error"), classes: 'red' });
    } finally {
      setLoading(false);
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
      setLoading(true);
      
      // Check if username is already taken
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (usernameCheckError) {
        console.error("Username check error:", usernameCheckError);
        M.toast({ html: 'Error checking username availability', classes: 'red' });
        setLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        M.toast({ html: 'Username already taken. Please choose another one.', classes: 'red' });
        setLoading(false);
        return;
      }
      
      // First step: Create the user in Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            auth_type: 'email',
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
  
      if (error) {
        console.error("Email signup error:", error);
        M.toast({ html: "Registration error: " + error.message, classes: 'red' });
        setLoading(false);
        return;
      }
      
      // Success!
      console.log("User registered successfully:", data);
      
      // Check if email confirmation is required
      if (data?.user?.identities?.[0]?.identity_data?.email_verified) {
        // If email is already verified (rare, but possible with some Supabase settings)
        M.toast({ html: 'Registration successful! Logging you in...', classes: 'green' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        // If email verification is required
        M.toast({ 
          html: `
            <div>
              <p><b>Registration successful!</b></p>
              <p>Please check your email to confirm your account.</p>
              <p>After confirmation, come back and <a href="/login" style="color: white; text-decoration: underline;">login here</a>.</p>
            </div>`, 
          classes: 'green', 
          displayLength: 8000 
        });
        setTimeout(() => navigate('/login'), 4000);
      }
  
    } catch (error) {
      console.error("Registration error:", error);
      M.toast({ html: 'Registration failed: ' + (error.message || "Unknown error"), classes: 'red' });
    } finally {
      setLoading(false);
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
                  disabled={loading}
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
                      disabled={loading}
                    />
                    <label htmlFor="wallet-username" className={username ? "active" : ""}>Choose a Username</label>
                  </div>
                  
                  <div className="center-align" style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <button 
                      type="submit" 
                      className="btn waves-effect waves-light orange darken-3"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Complete Registration with MetaMask'}
                      {!loading && <i className="material-icons right">how_to_reg</i>}
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
                    disabled={loading}
                  />
                  <label htmlFor="username" className={username ? "active" : ""}>Username</label>
                </div>

                <div className="input-field">
                  <i className="material-icons prefix blue-text">email</i>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <label htmlFor="email" className={email ? "active" : ""}>Email</label>
                </div>

                <div className="input-field">
                  <i className="material-icons prefix blue-text">lock</i>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
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
                    disabled={loading}
                  />
                  <label htmlFor="confirm-password">Confirm Password</label>
                </div>

                <div className="center-align" style={{ marginTop: '25px', marginBottom: '15px' }}>
                  <button 
                    type="submit" 
                    className="btn waves-effect waves-light blue darken-3 btn-large" 
                    style={{ width: '100%' }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Register with Email'}
                    {!loading && <i className="material-icons right">send</i>}
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