// src/pages/Marketplace.js
import React, { useState } from 'react';

const Marketplace = () => {
  const allCards = [
    { id: 1, name: 'Rare NFT', image: '/images/nft1.jpg', price: '2 ETH', category: 'art' },
    { id: 2, name: 'Legendary NFT', image: '/images/nft2.jpg', price: '5 ETH', category: 'music' },
    { id: 3, name: 'Epic NFT', image: '/images/nft3.jpg', price: '3 ETH', category: 'sports' },
    { id: 4, name: 'Mythic NFT', image: '/images/nft4.jpg', price: '4 ETH', category: 'art' },
    { id: 5, name: 'Classic NFT', image: '/images/nft5.jpg', price: '1 ETH', category: 'music' },
    { id: 6, name: 'Exclusive NFT', image: '/images/nft6.jpg', price: '6 ETH', category: 'sports' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const filteredCards = allCards.filter(card => 
    (category === '' || card.category === category) &&
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
    <div className="container" style={{ paddingTop: '20px' }}>
            <h3 style={{ color: 'black' }}>Marketplace</h3>
            <p style={{ color: 'black' }}>Browse and trade NFTs.</p>
      <div className="row" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div className="col s3">
          <select className="browser-default" style={{ width: '100%', borderRadius: '12px', padding: '10px' }} 
            onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
          </select>
        </div>
        <div className="col s9">
          <input type="text" className="browser-default" placeholder="Search NFTs..." 
            style={{ width: '100%', borderRadius: '12px', padding: '10px' }} 
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      
      
      <div className="row">
        {filteredCards.map((card) => (
          <div key={card.id} className="col s12 m4">
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', padding: '10px', backgroundColor: '#f8f9fa', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
              <div className="card-image" style={{ position: 'relative', textAlign: 'center' }}>
                <img src={card.image} alt={card.name} className="responsive-img" style={{ width: '100%', height: '200px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} />
              </div>
              <div className="card-content" style={{ color: 'black', display: 'flex', alignItems: 'center', padding: '15px' }}>
                <div style={{ textAlign: 'left', width: '80%', fontSize: '1rem', fontWeight: 'bold' }}>
                  <span className="card-title" style={{ color: 'black', display: 'block' }}>{card.name}</span>
                  <p style={{ color: 'black', fontSize: '0.9rem' }}>Price: {card.price}</p>
                </div>
                <button className="btn blue darken-3" style={{ borderRadius: '20px', padding: '8px 12px', fontSize: '0.9rem', width: '42%', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>Follow</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
