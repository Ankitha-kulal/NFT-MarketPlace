//hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.27",
  settings: {
    optimizer: {
      enabled: true,
      runs: 50,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337, // Ensures consistent network behavior
    },
  },
};
