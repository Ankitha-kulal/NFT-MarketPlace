// FINAL CONTRACT FILE (SINGLE FILE)Not inherited from other fiels

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMain is ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    uint256 public listingFee = 0.0015 ether;
    
    struct Listing {
        address seller;
        uint256 price;
        bool isListed;
    }
    
    mapping(uint256 => Listing) public listings;
    
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);

    constructor() ERC721("MyNFT", "MNFT") {}

    /// @notice Mint a new NFT with royalty
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
        
        if(royaltyReceiver != address(0)) {
            _setTokenRoyalty(newTokenId, royaltyReceiver, royaltyFee);
        }

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
            isListed: true
        });
        
        approve(address(this), tokenId);
        emit NFTListed(tokenId, price);
    }

    /// @notice Buy a listed NFT
    function buyNFT(uint256 tokenId) external payable {
        Listing storage item = listings[tokenId];

        require(item.isListed, "Not listed for sale");
        require(msg.value >= item.price, "Insufficient payment");

        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, msg.value);
        uint256 sellerAmount = msg.value - royaltyAmount;

        item.isListed = false;

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }
        
        payable(item.seller).transfer(sellerAmount);
        _transfer(item.seller, msg.sender, tokenId);

        emit NFTSold(tokenId, msg.sender, msg.value);
    }

    /// @notice Cancel a listing
    function cancelListing(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(listings[tokenId].isListed, "Not listed");
        
        delete listings[tokenId];
        emit ListingCancelled(tokenId);
    }

    /// @notice Get the marketplace listing fee
    function getListingPrice() external view returns (uint256) {
        return listingFee;
    }

    /// @notice Update the marketplace listing fee
    function updateListingPrice(uint256 _listingFee) external onlyOwner {
        listingFee = _listingFee;
    }

    /// @notice Withdraw marketplace fees to the contract owner
    function withdrawMarketplaceFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /// @notice View function to get all NFTs currently for sale
    function getListedNFTs() external view returns (uint256[] memory tokenIds, uint256[] memory prices) {
        uint256 totalSupply = _tokenIds.current();
        uint256 itemCount = 0;
        
        // Count listed items
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isListed) {
                itemCount++;
            }
        }
        
        // Create arrays
        tokenIds = new uint256[](itemCount);
        prices = new uint256[](itemCount);
        
        // Populate arrays
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isListed) {
                tokenIds[currentIndex] = i;
                prices[currentIndex] = listings[i].price;
                currentIndex++;
            }
        }
        
        return (tokenIds, prices);
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