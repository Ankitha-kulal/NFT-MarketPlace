import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NFTMainABI from '../contracts/NFTMain.json';
import { SUPPORTED_CHAIN_ID, CONTRACT_ADDRESS } from '../config';

// Create Context
const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if window.ethereum is available
        if (window.ethereum) {
          // Create ethers provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Get the network
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          // Use window.BigInt instead of BigInt directly
          setIsCorrectNetwork(network.chainId === window.BigInt(SUPPORTED_CHAIN_ID));

          // Get connected accounts
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const account = accounts[0].address;
            setAccount(account);
            
            // Get signer
            const signer = await provider.getSigner();
            setSigner(signer);
            
            // Get balance
            const balance = await provider.getBalance(account);
            setBalance(ethers.formatEther(balance));
            
            // Initialize contract
            const contract = new ethers.Contract(
              CONTRACT_ADDRESS,
              NFTMainABI.abi,
              signer
            );
            setContract(contract);
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setSigner(null);
      setBalance(null);
      setContract(null);
    } else {
      const newAccount = accounts[0];
      setAccount(newAccount);
      
      if (provider) {
        // Get signer
        const signer = await provider.getSigner();
        setSigner(signer);
        
        // Get balance
        const balance = await provider.getBalance(newAccount);
        setBalance(ethers.formatEther(balance));
        
        // Reinitialize contract with new signer
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTMainABI.abi,
          signer
        );
        setContract(contract);
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page to refresh all states
    window.location.reload();
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setIsLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          
          // Get provider and signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          const signer = await provider.getSigner();
          setSigner(signer);
          
          // Get balance
          const balance = await provider.getBalance(account);
          setBalance(ethers.formatEther(balance));
          
          // Get network
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          // Use window.BigInt instead of BigInt directly
          setIsCorrectNetwork(network.chainId === window.BigInt(SUPPORTED_CHAIN_ID));
          
          // Initialize contract
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            NFTMainABI.abi,
            signer
          );
          setContract(contract);
        }
      } else {
        alert("Please install MetaMask or another Ethereum wallet extension!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch network function
  const switchNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
        });
      }
    } catch (error) {
      // If the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          // For Sepolia testnet
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}`,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding ethereum chain:", addError);
        }
      } else {
        console.error("Error switching network:", error);
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setBalance(null);
    setContract(null);
  };
  // Refresh balance
  const refreshBalance = async () => {
    if (provider && account) {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    }
  };

  const value = {
    account,
    provider,
    signer,
    contract,
    balance,
    chainId,
    isCorrectNetwork,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Context;