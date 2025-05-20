import React, { useEffect, useState } from 'react';

const WalletConnect = ({ onWalletConnected, isWalletConnected, walletAddress, children }) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for MetaMask installation
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
              onWalletConnected(accounts[0], true);
            } else {
              onWalletConnected('', false);
            }
          });
          
          // Check if already connected
          provider.request({ method: 'eth_accounts' })
            .then(accounts => {
              console.log("Retrieved accounts:", accounts);
              if (accounts.length > 0) {
                onWalletConnected(accounts[0], true);
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
    
    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [onWalletConnected]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      // Inform the user to install MetaMask
      alert('MetaMask is not installed. Redirecting to download page.');
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }
    
    try {
      setLoading(true);
      // Get the provider - handles any Ethereum wallet, not just MetaMask
      const provider = window.ethereum || window.web3?.currentProvider;
      if (!provider) {
        // Fallback message if provider isn't accessible
        alert('Unable to detect Web3 wallet. Please make sure MetaMask is installed and unlocked.');
        return;
      }
      
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        onWalletConnected(accounts[0], true);
        
        // Success notification
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg';
        notificationDiv.textContent = 'Wallet connected successfully!';
        document.body.appendChild(notificationDiv);
        setTimeout(() => {
          document.body.removeChild(notificationDiv);
        }, 3000);
      }
    } catch (error) {
      console.error("Connection error:", error);
      // More helpful error message
      let errorMessage = error.message || "Unknown error";
      if (errorMessage.includes("User rejected")) {
        errorMessage = "Connection rejected. Please approve the connection in your wallet.";
      }
      alert('Failed to connect wallet: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-700/50 p-6 rounded-lg">
      <div className="flex justify-center mb-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
          alt="MetaMask Fox"
          className="h-16 w-16"
        />
      </div>
      
      <div className="mb-6">
        <button
          onClick={connectWallet}
          disabled={loading || isWalletConnected}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white 
            ${!isWalletConnected 
              ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
              : 'bg-green-600 cursor-default'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50`}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
            alt="MetaMask Fox"
            className="h-5 w-5 mr-2"
          />
          {isWalletConnected 
            ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
            : isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}
        </button>
      </div>
      
      {/* Render children only when wallet is connected */}
      {isWalletConnected && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;