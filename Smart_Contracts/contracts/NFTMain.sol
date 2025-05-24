// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMain is ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard  {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    uint256 public listingFee = 0.0015 ether;
    
    struct Listing {
        address seller;
        uint256 price;
        bool isListed;
    }
    
    struct Auction {
        address seller;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
    }

    struct Transaction {
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
        string transactionType; // "mint", "transfer", "sale"
    }
    
    // Mapping from token ID to its transaction history
    mapping(uint256 => Transaction[]) private _tokenTransactions;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(uint256 => Listing) public listings;
    
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);
    event TransactionRecorded(uint256 indexed tokenId, address from, address to, string transactionType);
    event AuctionStarted(uint256 indexed tokenId, uint256 minBid, uint256 duration);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 bid);
    event AuctionEnded(uint256 indexed tokenId, address winner, uint256 amount);

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
        
        // Record the minting transaction
        _recordTransaction(newTokenId, address(0), msg.sender, 0, "mint");

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
        address seller = item.seller;

        require(item.isListed, "Not listed for sale");
        require(msg.value >= item.price, "Insufficient payment");

        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, msg.value);
        uint256 sellerAmount = msg.value - royaltyAmount;

        item.isListed = false;

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }
        
        payable(seller).transfer(sellerAmount);
        _transfer(seller, msg.sender, tokenId);
        
        // Record the sale transaction
        _recordTransaction(tokenId, seller, msg.sender, msg.value, "sale");

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
    

    function startAuction(uint256 tokenId, uint256 minBid, uint256 duration) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!auctions[tokenId].active, "Auction already active");

        auctions[tokenId] = Auction({
            seller: msg.sender,
            highestBid: minBid,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            active: true
        });

        approve(address(this), tokenId);
        emit AuctionStarted(tokenId, minBid, duration);
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            bids[tokenId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not yet ended");

        auction.active = false;

        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, tokenId);
            payable(auction.seller).transfer(auction.highestBid);
            _recordTransaction(tokenId, auction.seller, auction.highestBidder, auction.highestBid, "auction");
            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        }
    }

    function withdrawBid(uint256 tokenId) external nonReentrant {
        uint256 refund = bids[tokenId][msg.sender];
        require(refund > 0, "No funds to withdraw");
        bids[tokenId][msg.sender] = 0;
        payable(msg.sender).transfer(refund);
    }
    
    /// @notice Internal function to record token transactions
    function _recordTransaction(
        uint256 tokenId,
        address from,
        address to,
        uint256 price,
        string memory transactionType
    ) internal {
        Transaction memory newTransaction = Transaction({
            from: from,
            to: to,
            price: price,
            timestamp: block.timestamp,
            transactionType: transactionType
        });
        
        _tokenTransactions[tokenId].push(newTransaction);
        emit TransactionRecorded(tokenId, from, to, transactionType);
    }
    
    /// @notice Override _transfer to record token transfers
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._transfer(from, to, tokenId);
        
        // Only record regular transfers (not sales, which are recorded separately)
        if (!listings[tokenId].isListed) {
            _recordTransaction(tokenId, from, to, 0, "transfer");
        }
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
    
    /// @notice Get all NFTs owned by a specific address
    function getNFTsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256 ownedCount = 0;
        
        // Count owned tokens
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                ownedCount++;
            }
        }
        
        // Create array
        uint256[] memory ownedTokens = new uint256[](ownedCount);
        
        // Populate array
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                ownedTokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return ownedTokens;
    }
    
    /// @notice Get all NFTs created by a specific address
    function getNFTsCreatedBy(address creator) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256 createdCount = 0;
        
        // Count created tokens
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && _tokenTransactions[i].length > 0 && _tokenTransactions[i][0].to == creator) {
                createdCount++;
            }
        }
        
        // Create array
        uint256[] memory createdTokens = new uint256[](createdCount);
        
        // Populate array
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && _tokenTransactions[i].length > 0 && _tokenTransactions[i][0].to == creator) {
                createdTokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return createdTokens;
    }
    
    /// @notice Get the full transaction history of a specific token
    function getTokenTransactionHistory(uint256 tokenId) external view returns (
        address[] memory fromAddresses,
        address[] memory toAddresses,
        uint256[] memory prices,
        uint256[] memory timestamps,
        string[] memory transactionTypes
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        uint256 count = _tokenTransactions[tokenId].length;
        
        fromAddresses = new address[](count);
        toAddresses = new address[](count);
        prices = new uint256[](count);
        timestamps = new uint256[](count);
        transactionTypes = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Transaction memory txn = _tokenTransactions[tokenId][i];
            fromAddresses[i] = txn.from;
            toAddresses[i] = txn.to;
            prices[i] = txn.price;
            timestamps[i] = txn.timestamp;
            transactionTypes[i] = txn.transactionType;
        }
        
        return (fromAddresses, toAddresses, prices, timestamps, transactionTypes);
    }
    
    /// @notice Get all token IDs that exist in the contract
    function getAllTokens() external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256 existingCount = 0;
        
        // Count existing tokens
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i)) {
                existingCount++;
            }
        }
        
        // Create array
        uint256[] memory existingTokens = new uint256[](existingCount);
        
        // Populate array
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i)) {
                existingTokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return existingTokens;
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