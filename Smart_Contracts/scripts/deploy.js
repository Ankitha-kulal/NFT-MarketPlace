// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const NFTMain = await ethers.getContractFactory("NFTMain");
  
  // Deploy the contract
  console.log("Deploying NFTMain contract...");
  const nftContract = await NFTMain.deploy();
  
  // Wait for the contract to be deployed
  await nftContract.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await nftContract.getAddress();
  
  console.log("NFTMain contract deployed to:", contractAddress);
  
  // Current listing fee from contract
  const listingFee = await nftContract.getListingPrice();
  console.log("Current listing fee:", ethers.formatEther(listingFee), "ETH");
  
  console.log("Deployment complete!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });