// Network Configuration
export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia testnet
export const NETWORK_NAME = 'Sepolia';

// Contract Configuration
export const CONTRACT_ADDRESS = '0x9d91c1FA83a490eE4c1F398531F6EC4024Ee9b89'; // Replace with your actual contract address

// IPFS Configuration
export const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// API URLs
export const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Feature Flags
export const FEATURES = {
  COLLECTIONS: true,
  AUCTIONS: false,
  LAZYMINT: false,
  ROYALTIES: true,
};

// Other Configuration
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];