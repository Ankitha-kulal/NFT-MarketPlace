import React from 'react';

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      image: '/images/nft1.jpg',  // Add your NFT image path
      name: 'NFT Artwork 1',
      price: '0.089 ETH',
    },
    {
      id: 2,
      image: '/images/nft2.jpg',  // Add your NFT image path
      name: 'NFT Artwork 2',
      price: '0.089 ETH',
    }
  ];

  const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(3); // Calculate total price

  return (
    <div className="container" style={{ marginTop: '30px', width: '90%' }}>
      <div className="card-3d-container" style={{ marginBottom: '10px' }}>
        {/* Card Container */}
        <div className="card z-depth-3" style={{ padding: '15px', maxWidth: '350px', margin: '0 auto', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {/* Header */}
          <h5 style={{ color: 'black', textAlign: 'center', fontSize: '18px' }}>My Cart</h5>
          
          {/* Clear All Button */}
          <div className="right-align" style={{ marginBottom: '10px' }}>
            <button className="btn red darken-3" style={{ fontSize: '12px' }}>Clear All</button>
          </div>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <div key={item.id} className="card z-depth-2" style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', borderRadius: '10px', marginBottom: '10px' }}>
              <div className="row">
                {/* NFT Image */}
                <div className="col s4">
                  <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '8px' }} />
                </div>
                {/* NFT Details */}
                <div className="col s8" style={{ paddingLeft: '10px' }}>
                  <h6 style={{ color: 'black', fontSize: '14px' }}>{item.name}</h6>
                  <p style={{ color: 'black', fontSize: '12px' }}>Price: <span style={{ color: '#ff9800', fontSize: '12px' }}>{item.price}</span></p>
                </div>
              </div>
            </div>
          ))}

          {/* Total Price */}
          <div className="right-align" style={{ fontWeight: 'bold', color: 'black', fontSize: '14px', marginBottom: '10px' }}>
            <p>Total Price: <span style={{ color: '#ff9800', fontSize: '14px' }}>{totalPrice} ETH</span></p>
          </div>

          {/* Buy Now Button */}
          <div className="center-align">
            <button className="btn waves-effect waves-light green darken-2" style={{ width: '100%', borderRadius: '20px', fontSize: '14px' }}>
              Buy Now
              <i className="material-icons right" style={{ color: 'blue', fontSize: '18px' }}>shopping_cart</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
