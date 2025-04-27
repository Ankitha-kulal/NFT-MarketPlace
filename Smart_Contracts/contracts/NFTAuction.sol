//contracts/NFTAuction.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./NFTMarketplaceBase.sol";

contract NFTAuction is NFTMarketplaceBase {

    address payable public marketplaceOwner;

    event AuctionStarted(uint256 indexed tokenId, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);
    event BidWithdrawn(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event NFTClaimed(uint256 indexed tokenId, address indexed seller);

    constructor() {
        marketplaceOwner = payable(msg.sender);
    }

    function _startAuction(uint256 tokenId, uint256 biddingTime) internal {
        require(!auctions[tokenId].isActive, "Auction already active");

        uint256 endTime = block.timestamp + biddingTime;
        auctions[tokenId] = Auction({
            highestBid: 0,
            highestBidder: address(0),
            endTime: endTime,
            isActive: true
        });

        emit AuctionStarted(tokenId, endTime);
    }

    function _placeBid(uint256 tokenId) internal {
        Auction storage auction = auctions[tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            bids[tokenId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function _finalizeAuction(uint256 tokenId, address payable seller) internal returns (address, uint256) {
        Auction storage auction = auctions[tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.isActive = false;

        uint256 highestBid = auction.highestBid;
        address winner = auction.highestBidder;

        emit AuctionEnded(tokenId, winner, highestBid);

        if (highestBid > 0) {
            uint256 fee = (highestBid *  listingFee) / 1 ether;
            uint256 sellerAmount = highestBid - fee;

            seller.transfer(sellerAmount);
            marketplaceOwner.transfer(fee);
        }

        return (winner, highestBid);
    }

    function withdrawBid(uint256 tokenId) public {
        uint256 amount = bids[tokenId][msg.sender];
        require(amount > 0, "No bid to withdraw");

        bids[tokenId][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");

        emit BidWithdrawn(tokenId, msg.sender, amount);
    }

    function withdrawFees() external {
        require(msg.sender == marketplaceOwner, "Not marketplace owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        (bool success, ) = marketplaceOwner.call{value: balance}("");
        require(success, "Withdraw failed");

        emit FeesWithdrawn(msg.sender, balance);
    }

    function claimUnsoldNFT(uint256 tokenId) external {
        Auction storage auction = auctions[tokenId];
        require(!auction.isActive, "Auction still active");
        require(auction.highestBid == 0, "Auction had bids");

        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not seller");

        listing.isListed = false; // remove from sale/auction
        emit NFTClaimed(tokenId, msg.sender);
    }
}
