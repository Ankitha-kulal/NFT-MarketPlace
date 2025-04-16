// import React, { useState } from 'react';
// import { ethers } from 'ethers';

// const WalletConnect = () => {
//   const [walletAddress, setWalletAddress] = useState(null);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const accounts = await provider.send("eth_requestAccounts", []);
//         setWalletAddress(accounts[0]); // Store the connected wallet address
//       } catch (error) {
//         console.error("User denied wallet connection", error);
//       }
//     } else {
//       alert("MetaMask not detected! Please install it.");
//     }
//   };

//   return (
//     <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
//       <h3>Connect Your Wallet</h3>
//       {/* 3D Card Container */}
//       <div className="unique-card-3d-container">
//         <div className="unique-card-3d">
//           <button className="unique-connect-btn" onClick={connectWallet}>
//             <img
//               src="/images/metamask.png"  // Ensure you have the MetaMask fox image here
//               alt="MetaMask"
//               style={{ width: '150px', marginRight: '15px' }}
//             />
//           </button>
//         </div>
//       </div>
//       {walletAddress && <p>Wallet Connected: {walletAddress}</p>}
//     </div>
//   );
// };

// export default WalletConnect;

import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]); // Store the connected wallet address
      } catch (error) {
        console.error("User denied wallet connection", error);
      }
    } else {
      alert("MetaMask not detected! Please install it.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null); // Reset the wallet address
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h3>Connect Your Wallet</h3>
      {/* 3D Card Container */}
      <div className="unique-card-3d-container">
        <div className="unique-card-3d">
          {!walletAddress ? (
            <button className="unique-connect-btn" onClick={connectWallet}>
              <img
                src="/images/metamask.png"  // Ensure you have the MetaMask fox image here
                alt="MetaMask"
                style={{ width: '150px', marginRight: '15px' }}
              />
            </button>
          ) : (
            <button className="unique-connect-btn" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>
      {walletAddress && <p>Wallet Connected: {walletAddress}</p>}
    </div>
  );
};

export default WalletConnect;
