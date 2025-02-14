// src/components/Card.js
import React from 'react';

const Card = ({ image, title, description, price }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={image} alt={title} />
      </div>
      <div className="card-content">
        <h5>{title}</h5>
        <p>{description}</p>
        <p><strong>Price:</strong> {price}</p>
      </div>
    </div>
  );
};

export default Card;