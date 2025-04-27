const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let marketplace, owner, seller, buyer, royaltyReceiver;
  const TOKEN_URI = "https://www.test-token-uri.com/1";
  const ROYALTY_PERCENTAGE = 500; // 5% (in basis points)

  beforeEach(async function () {
    [owner, seller, buyer, royaltyReceiver] = await ethers.getSigners();
    
    const NFTMarketplace = await ethers.getContractFactory("NFTMain");
    marketplace = await NFTMarketplace.deploy();
    
    listingPrice = await marketplace.getListingPrice();
    PRICE = ethers.parseEther("1");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should set correct initial listing price", async function () {
      expect(await marketplace.getListingPrice()).to.equal(ethers.parseEther("0.0015"));
    });
  });

  describe("Core Functionality", function () {
    it("Should create, list and sell an NFT with royalties", async function () {
      // 1. Mint NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // Check ownership
      expect(await marketplace.ownerOf(1)).to.equal(seller.address);
      
      // 2. List NFT
      await marketplace.connect(seller).listNFT(1, PRICE);
      
      // 3. Get seller and royalty receiver initial balances
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);
      
      // 4. Buy NFT
      await marketplace.connect(buyer).buyNFT(1, { value: PRICE });
      
      // 5. Check ownership transferred
      expect(await marketplace.ownerOf(1)).to.equal(buyer.address);
      
      // 6. Check royalty payment
      const royaltyAmount = PRICE * BigInt(ROYALTY_PERCENTAGE) / BigInt(10000);
      const sellerAmount = PRICE - royaltyAmount;
      
      const finalRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);
      expect(finalRoyaltyBalance - initialRoyaltyBalance).to.equal(royaltyAmount);
      
      // 7. Check seller payment
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance - initialSellerBalance).to.equal(sellerAmount);
    });
    
    it("Should allow listing cancellation", async function () {
      // Mint NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        ethers.ZeroAddress,
        0,
        { value: listingPrice }
      );
      
      // List NFT
      await marketplace.connect(seller).listNFT(1, PRICE);
      
      // Cancel listing
      await marketplace.connect(seller).cancelListing(1);
      
      // Try to buy - should fail
      await expect(
        marketplace.connect(buyer).buyNFT(1, { value: PRICE })
      ).to.be.revertedWith("Not listed for sale");
    });
    
    it("Should allow owner to withdraw marketplace fees", async function () {
      // Mint NFT to generate fees
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        ethers.ZeroAddress,
        0,
        { value: listingPrice }
      );
      
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      // Withdraw fees
      const tx = await marketplace.connect(owner).withdrawMarketplaceFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      // Owner should receive the listing fee minus gas costs
      expect(finalOwnerBalance - initialOwnerBalance + gasUsed).to.be.closeTo(
        listingPrice,
        ethers.parseEther("0.0001")
      );
    });
  });
});