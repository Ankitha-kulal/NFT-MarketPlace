import React from 'react';

const MyCard = () => {
  const cards = [
    { id: 1, name: 'NFT #1', image: '/images/nft-banner.jpg', status: 'Completed' },
    { id: 2, name: 'NFT #2', image: '/images/nft-banner.jpg', status: 'Completed' },
    { id: 3, name: 'NFT #3', image: '/images/nft-banner.jpg', status: 'Completed' },
    { id: 4, name: 'NFT #4', image: '/images/nft-banner.jpg', status: 'Completed' },
    { id: 5, name: 'NFT #5', image: '/images/nft-banner.jpg', status: 'Completed' },
    { id: 6, name: 'NFT #6', image: '/images/nft-banner.jpg', status: 'Completed' }
  ];

  return (
    <div className="container">
      <h3 className="black-text center-align">My NFT Collection</h3>
      <p className="black-text center-align">View and manage your NFT Collection.</p>
      <div className="row">
        {cards.map((card) => (
          <div key={card.id} className="col s12 m4">
            <div className="card hoverable z-depth-3">
              <div className="card-image">
                <img src={card.image} alt={card.name} className="responsive-img" />
              </div>
              <div className="card-content black-text">
                <span className="card-title black-text">{card.name}</span>
                <p>Status: {card.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCard;
