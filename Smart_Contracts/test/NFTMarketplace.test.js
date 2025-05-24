const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let marketplace, owner, seller, buyer, royaltyReceiver, thirdParty;
  const TOKEN_URI = "https://www.test-token-uri.com/1";
  const TOKEN_URI_2 = "https://www.test-token-uri.com/2";
  const ROYALTY_PERCENTAGE = 500; // 5% (in basis points)
  let PRICE;
  let listingPrice;

  beforeEach(async function () {
    [owner, seller, buyer, royaltyReceiver, thirdParty] = await ethers.getSigners();
    
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
  
  describe("Transaction History", function () {
    it("Should record transaction history when minting an NFT", async function () {
      // Mint NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // Get transaction history
      const history = await marketplace.getTokenTransactionHistory(1);
      
      // Check history
      expect(history.fromAddresses[0]).to.equal(ethers.ZeroAddress);
      expect(history.toAddresses[0]).to.equal(seller.address);
      expect(history.transactionTypes[0]).to.equal("mint");
      expect(history.prices[0]).to.equal(0);
      expect(history.timestamps[0]).to.be.gt(0);
    });
    
    it("Should record transaction history for transfers and sales", async function () {
      // Mint NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // List NFT
      await marketplace.connect(seller).listNFT(1, PRICE);
      
      // Buy NFT
      await marketplace.connect(buyer).buyNFT(1, { value: PRICE });
      
      // Transfer NFT
      await marketplace.connect(buyer).transferFrom(buyer.address, thirdParty.address, 1);
      
      // Get transaction history
      const history = await marketplace.getTokenTransactionHistory(1);
      
      // The transfer count may vary - some implementations might record listing as well
      // Check minimum expected transactions (mint, sale, transfer)
      expect(history.fromAddresses.length).to.be.at.least(3);
      
      // Check mint - always at position 0
      expect(history.fromAddresses[0]).to.equal(ethers.ZeroAddress);
      expect(history.toAddresses[0]).to.equal(seller.address);
      expect(history.transactionTypes[0]).to.equal("mint");
      
      // Find the sale transaction - look for seller to buyer
      let saleIndex = -1;
      for (let i = 0; i < history.fromAddresses.length; i++) {
        if (history.fromAddresses[i] === seller.address && 
            history.toAddresses[i] === buyer.address &&
            history.transactionTypes[i] === "sale") {
          saleIndex = i;
          break;
        }
      }
      expect(saleIndex).to.be.greaterThan(-1, "Sale transaction not found");
      expect(history.prices[saleIndex]).to.equal(PRICE);
      
      // Find the transfer transaction - look for buyer to thirdParty
      let transferIndex = -1;
      for (let i = 0; i < history.fromAddresses.length; i++) {
        if (history.fromAddresses[i] === buyer.address && 
            history.toAddresses[i] === thirdParty.address &&
            history.transactionTypes[i] === "transfer") {
          transferIndex = i;
          break;
        }
      }
      expect(transferIndex).to.be.greaterThan(-1, "Transfer transaction not found");
    });
  });
  
  describe("NFT Getter Functions", function () {
    beforeEach(async function () {
      // Mint two NFTs with seller
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI_2,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // Mint one NFT with buyer
      await marketplace.connect(buyer).mintNFT(
        "https://www.test-token-uri.com/3",
        buyer.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // Transfer one of seller's NFTs to buyer
      await marketplace.connect(seller).transferFrom(seller.address, buyer.address, 1);
    });
    
    it("Should get all NFTs owned by an address", async function () {
      // Get NFTs owned by seller
      const sellerNFTs = await marketplace.getNFTsByOwner(seller.address);
      expect(sellerNFTs.length).to.equal(1);
      expect(Number(sellerNFTs[0])).to.equal(2);
      
      // Get NFTs owned by buyer
      const buyerNFTs = await marketplace.getNFTsByOwner(buyer.address);
      expect(buyerNFTs.length).to.equal(2);
      
      // Convert BigInts to Numbers for easier comparison
      const buyerNFTsArray = buyerNFTs.map(id => Number(id));
      expect(buyerNFTsArray).to.include(1);
      expect(buyerNFTsArray).to.include(3);
    });
    
    it("Should get all NFTs created by an address", async function () {
      // Get NFTs created by seller
      const sellerCreated = await marketplace.getNFTsCreatedBy(seller.address);
      expect(sellerCreated.length).to.equal(2);
      
      // Convert BigInts to Numbers for easier comparison
      const sellerCreatedArray = sellerCreated.map(id => Number(id));
      expect(sellerCreatedArray).to.include(1);
      expect(sellerCreatedArray).to.include(2);
      
      // Get NFTs created by buyer
      const buyerCreated = await marketplace.getNFTsCreatedBy(buyer.address);
      expect(buyerCreated.length).to.equal(1);
      expect(Number(buyerCreated[0])).to.equal(3);
    });
    
    it("Should get all tokens", async function () {
      const allTokens = await marketplace.getAllTokens();
      expect(allTokens.length).to.equal(3);
      
      // Convert BigInts to Numbers for easier comparison
      const allTokensArray = allTokens.map(id => Number(id));
      expect(allTokensArray).to.include(1);
      expect(allTokensArray).to.include(2);
      expect(allTokensArray).to.include(3);
    });
    
    it("Should get all listed NFTs", async function () {
      // List one of seller's NFTs
      await marketplace.connect(seller).listNFT(2, PRICE);
      
      // List one of buyer's NFTs with double price
      await marketplace.connect(buyer).listNFT(3, ethers.parseEther("2"));
      
      // Get listed NFTs
      const [listedTokenIds, listedPrices] = await marketplace.getListedNFTs();
      
      expect(listedTokenIds.length).to.equal(2);
      
      // Convert BigInts to Numbers for easier comparison
      const listedTokenIdsArray = listedTokenIds.map(id => Number(id));
      expect(listedTokenIdsArray).to.include(2);
      expect(listedTokenIdsArray).to.include(3);
      
      // Find index of token 3 in the array
      const indexOfToken3 = listedTokenIdsArray.indexOf(3);
      
      // Check the price of token 3
      expect(listedPrices[indexOfToken3]).to.equal(ethers.parseEther("2"));
    });
  });
  
  describe("Error Handling", function () {
    it("Should fail when trying to get transaction history for non-existent token", async function () {
      await expect(
        marketplace.getTokenTransactionHistory(999)
      ).to.be.revertedWith("Token does not exist");
    });
    
    it("Should fail when non-owner tries to list an NFT", async function () {
      // Mint NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      // Try to list from non-owner account
      await expect(
        marketplace.connect(buyer).listNFT(1, PRICE)
      ).to.be.revertedWith("Not the owner");
    });
    
    it("Should fail when non-owner tries to cancel a listing", async function () {
      // Mint and list NFT
      await marketplace.connect(seller).mintNFT(
        TOKEN_URI,
        royaltyReceiver.address,
        ROYALTY_PERCENTAGE,
        { value: listingPrice }
      );
      
      await marketplace.connect(seller).listNFT(1, PRICE);
      
      // Try to cancel from non-owner account
      await expect(
        marketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWith("Not the owner");
    });
  });
});


describe("Auction Functionality", function () {
  it("Should allow starting, bidding and ending an auction", async function () {
    // 1. Mint NFT by seller
    await marketplace.connect(seller).mintNFT(
      TOKEN_URI,
      ethers.ZeroAddress,
      0,
      { value: listingPrice }
    );

    // 2. Start Auction
    const minBid = ethers.parseEther("1");
    const duration = 60; // seconds
    await marketplace.connect(seller).startAuction(1, minBid, duration);

    // 3. Place bid by buyer
    await marketplace.connect(buyer).placeBid(1, { value: ethers.parseEther("1.2") });

    // 4. Place higher bid by thirdParty
    await marketplace.connect(thirdParty).placeBid(1, { value: ethers.parseEther("1.5") });

    // 5. Wait for auction to end
    await network.provider.send("evm_increaseTime", [61]);
    await network.provider.send("evm_mine");

    // 6. End auction
    const tx = await marketplace.connect(seller).endAuction(1);
    await tx.wait();

    // 7. Check final owner
    expect(await marketplace.ownerOf(1)).to.equal(thirdParty.address);

    // 8. Check transaction history
    const history = await marketplace.getTokenTransactionHistory(1);
    const lastIndex = history.fromAddresses.length - 1;
    expect(history.transactionTypes[lastIndex]).to.equal("auction");
    expect(history.toAddresses[lastIndex]).to.equal(thirdParty.address);
  });

  it("Should allow refunding outbid participants", async function () {
    // Mint and start auction
    await marketplace.connect(seller).mintNFT(TOKEN_URI, ethers.ZeroAddress, 0, { value: listingPrice });
    await marketplace.connect(seller).startAuction(1, ethers.parseEther("1"), 60);

    // Place bid by buyer
    await marketplace.connect(buyer).placeBid(1, { value: ethers.parseEther("1.2") });

    // Place higher bid by thirdParty
    await marketplace.connect(thirdParty).placeBid(1, { value: ethers.parseEther("1.5") });

    // Check refund
    const refund = await marketplace.bids(1, buyer.address);
    expect(refund).to.equal(ethers.parseEther("1.2"));

    // Withdraw refund
    const initial = await ethers.provider.getBalance(buyer.address);
    const tx = await marketplace.connect(buyer).withdrawBid(1);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const final = await ethers.provider.getBalance(buyer.address);
    expect(final - initial + gasUsed).to.equal(refund);
  });
});
