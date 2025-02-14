import React, { useState } from 'react';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');

  const cards = [
    { id: 1, name: 'Rare NFT', image: '/images/nft1.jpg', price: 2, category: 'art', blockchain: 'ethereum', creator: 'John Doe', creatorImage: '/images/logo.png' },
    { id: 2, name: 'Legendary NFT', image: '/images/nft2.jpg', price: 5, category: 'music', blockchain: 'polygon', creator: 'Alice Smith', creatorImage: '/images/logo.png' },
    { id: 3, name: 'Epic NFT', image: '/images/nft3.jpg', price: 3, category: 'sports', blockchain: 'ethereum', creator: 'Bob Johnson', creatorImage: '/images/logo.png' },
    { id: 4, name: 'Mythic NFT', image: '/images/nft4.jpg', price: 4, category: 'art', blockchain: 'polygon', creator: 'Emma Brown', creatorImage: '/images/logo.png' },
    { id: 5, name: 'Classic NFT', image: '/images/nft5.jpg', price: 1, category: 'music', blockchain: 'ethereum', creator: 'David Lee', creatorImage: '/images/logo.png' },
    { id: 6, name: 'Exclusive NFT', image: '/images/nft6.jpg', price: 6, category: 'sports', blockchain: 'polygon', creator: 'Sophia Wilson', creatorImage: '/images/profile6.jpg' }
  ];

  const filteredCards = cards.filter(card => {
    return (
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || card.category === selectedCategory) &&
      (selectedBlockchain === '' || card.blockchain === selectedBlockchain) &&
      (selectedPrice === '' || card.price <= Number(selectedPrice)) &&
      (selectedCreator === '' || card.creator.toLowerCase().includes(selectedCreator.toLowerCase()))
    );
  });

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h3 style={{ color: 'black' }}>Explore</h3>
      <p style={{ color: 'black' }}>Browse and trade NFTs.</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <input 
          type="text" 
          className="browser-default" 
          placeholder="Search NFTs..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '70%', borderRadius: '12px', padding: '10px' }} 
        />
       <select
          className="browser-default"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: '30%', borderRadius: '12px', padding: '10px' }}
        >
          <option value="">All Categories</option>
          <option value="userCategory">User Category</option>
        </select>

      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="col s4" style={{ padding: '20px', background: '#e3f2fd', borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', height: 'fit-content', width: '30%' }}>
          <h5 style={{ color: 'black' }}>Filters</h5>
          <label>Category</label>
          <select 
            className="browser-default" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            style={{ width: '100%', borderRadius: '12px', padding: '10px', marginBottom: '10px' }}
          >
            <option value="">All Categories</option>
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
          </select>
          <label>Price (ETH)</label>
          <input 
            type="number" 
            className="browser-default" 
            placeholder="Max Price" 
            value={selectedPrice} 
            onChange={(e) => setSelectedPrice(e.target.value)} 
            style={{ width: '100%', borderRadius: '12px', padding: '10px', marginBottom: '10px' }}
          />
          <label>Blockchain</label>
          <select 
            className="browser-default" 
            value={selectedBlockchain} 
            onChange={(e) => setSelectedBlockchain(e.target.value)} 
            style={{ width: '100%', borderRadius: '12px', padding: '10px', marginBottom: '10px' }}
          >
            <option value="">All Blockchains</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
          <label>Creator</label>
          <input 
            type="text" 
            className="browser-default" 
            placeholder="Creator Name" 
            value={selectedCreator} 
            onChange={(e) => setSelectedCreator(e.target.value)} 
            style={{ width: '100%', borderRadius: '12px', padding: '10px', marginBottom: '10px' }}
          />
        </div>

        <div className="col s8" style={{ width: '70%' }}>
          <div className="row">
            {filteredCards.map((card) => (
              <div key={card.id} className="col s12 m6 l4">
                <div className="card" style={{ borderRadius: '12px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                  <div className="card-image" style={{ textAlign: 'center' }}>
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="responsive-img" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    />
                  </div>
                  <div className="card-content" style={{ color: 'black', padding: '10px' }}>
                    <span className="card-title black-text">{card.name}</span>
                    <p>Price: {card.price} ETH</p>
                    <p>Creator: {card.creator}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
