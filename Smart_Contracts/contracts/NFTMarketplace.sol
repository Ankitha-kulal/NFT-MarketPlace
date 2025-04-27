//contracts/NFTMarketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./NFTMarketplaceBase.sol";
import "./NFTAuction.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NFTMarketplace is ERC721URIStorage, ERC2981, Ownable, NFTMarketplaceBase, NFTAuction {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);

    constructor() ERC721("MyNFT", "MNFT") {}

    /// @notice Mint a new NFT with royalty and listing fee
    function mintNFT(
        string calldata tokenURI, 
        address royaltyReceiver, 
        uint96 royaltyFee
    ) external payable returns (uint256) {
        require(msg.value >= listingFee, "Insufficient listing fee");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _setTokenRoyalty(newTokenId, royaltyReceiver, royaltyFee);

        emit NFTMinted(newTokenId, msg.sender, tokenURI);

        return newTokenId;
    }

    /// @notice List an NFT for sale
    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be positive");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isAuction: false,
            isListed: true,
            isSold: false   
        });
        approve(address(this), tokenId);

        emit NFTListed(tokenId, price);
    }

    /// @notice Buy a listed NFT
    function buyNFT(uint256 tokenId) external payable {
        Listing storage item = listings[tokenId];

        require(item.isListed, "Not listed");
        require(msg.value >= item.price, "Insufficient payment");

        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, msg.value);
        uint256 sellerAmount = msg.value - royaltyAmount;

        item.isListed = false;
        item.isSold = true;

        if (royaltyAmount > 0) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }
        payable(item.seller).transfer(sellerAmount);

        _transfer(item.seller, msg.sender, tokenId);

        emit NFTSold(tokenId, msg.sender, msg.value);
    }

    /// @notice Get the marketplace listing fee
    function getListingPrice() external view returns (uint256) {
        return listingFee;
    }

/// @notice Update the marketplace listing fee
/// @param _listingFee New listing fee
function updateListingPrice(uint256 _listingFee) external {
    require(owner() == msg.sender, "Only owner can call");
    listingFee = _listingFee;
}

// Alternative fetchMyNFTs implementation to match test expectations
struct NFTItem {
    uint256 tokenId;
    address owner;
    uint256 price;
    bool isListed;
}

function fetchMyNFTs() external view returns (NFTItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;
    
    // Count owned items
    for (uint256 i = 1; i <= totalItemCount; i++) {
        if (_exists(i) && ownerOf(i) == msg.sender) {
            itemCount++;
        }
    }
    
    // Create and fill array
    NFTItem[] memory items = new NFTItem[](itemCount);
    uint256 currentIndex = 0;
    
    for (uint256 i = 1; i <= totalItemCount; i++) {
        if (_exists(i) && ownerOf(i) == msg.sender) {
            Listing storage listing = listings[i];
            
            items[currentIndex] = NFTItem({
                tokenId: i,
                owner: msg.sender,
                price: listing.price,
                isListed: listing.isListed
            });
            
            currentIndex++;
        }
    }
    
    return items;
}

/// @notice Withdraw accumulated marketplace fees to the contract owner
function withdrawMarketplaceFees() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No fees to withdraw");
    
    address payable ownerPayable = payable(owner());
    (bool success, ) = ownerPayable.call{value: balance}("");
    require(success, "Transfer failed");
}

    // Function to fetch all listed market items
function fetchMarketItems() external view returns (Listing[] memory) {
    uint256 itemCount = _tokenIds.current();
    Listing[] memory items = new Listing[](itemCount);
    uint256 currentIndex = 0;

    for (uint256 i = 1; i <= itemCount; i++) {
        if (listings[i].isListed && !listings[i].isSold) {
            items[currentIndex] = listings[i];
            currentIndex++;
        }
    }

    return items;
}


    /// @notice Cancel a listed NFT
    function cancelListing(uint256 tokenId) external {
        Listing storage item = listings[tokenId];

        require(item.isListed, "Not listed");
        require(item.seller == msg.sender, "Not the seller");

        item.isListed = false;
        item.isSold = true; 

        emit ListingCancelled(tokenId);
    }


    /// @notice Start an auction for an NFT
    function startAuction(uint256 tokenId, uint256 duration) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        approve(address(this), tokenId);
        _startAuction(tokenId, duration);
    }

    /// @notice Re-list an already purchased NFT for resale
function reSellToken(uint256 tokenId, uint256 price) external payable {
    require(ownerOf(tokenId) == msg.sender, "You are not the token owner");
    require(price > 0, "Price must be greater than zero");
    require(msg.value >= listingFee, "Listing fee required");

    listings[tokenId] = Listing({
        seller: msg.sender,
        price: price,
        isAuction: false,
        isListed: true,
        isSold: false
    });

    approve(address(this), tokenId);

    emit NFTListed(tokenId, price);
}


    /// @notice Place a bid on an auction
    function placeBid(uint256 tokenId) external payable {
        _placeBid(tokenId);
    }

    /// @notice Finalize an auction and transfer NFT
    function finalizeAuction(uint256 tokenId) external {
        Auction memory auction = auctions[tokenId];

        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still running");

        address seller = ownerOf(tokenId);
        (address winner, ) = _finalizeAuction(tokenId, payable(seller));

        _transfer(seller, winner, tokenId);
    }

    /// @notice Supports interface check for ERC721 and ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
