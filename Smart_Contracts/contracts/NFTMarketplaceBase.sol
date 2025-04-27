// contracts/NFTMarketplaceBase.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

abstract contract NFTMarketplaceBase {
    uint256 public listingFee = 0.0015 ether;

    struct Listing {
        address seller;
        uint256 price;
        bool isAuction;
         bool isListed;
        bool isSold;
    }

  struct Auction {
    uint256 highestBid;
    address highestBidder;
    uint256 endTime;
    bool isActive; 
}

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;
}
