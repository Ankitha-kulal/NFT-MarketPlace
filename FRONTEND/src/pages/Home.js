import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        {/* Badge */}
        <div className="badge">
          <Sparkles size={16} className="badge-icon" />
          <span className="badge-text">The Future of Digital Collectibles</span>
        </div>

        {/* Heading */}
        <h1 className="main-heading">
          Discover & Collect <span className="highlight">Extraordinary</span> NFTs
        </h1>
        {/* Description */}
        <p className="main-description">
          Your premier marketplace for digital arts, gaming assets, and stunning photography collectibles. Own the uniqueness in the digital world.
        </p>

        {/* Buttons */}
        <div className="button-group">
          <button className="get-started-btn"
          onClick={() => window.location.href = '/register'}
          
          >
            Get Started
            <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
          </button>
          <button className="learn-more-btn">
            Learn More
          </button>
        </div>

       
        {/* slider */}
        

        {/* Footer */}
        <div className="footer">
          © 2025 NFT Platform • The Home for Digital Collectibles
        </div>
      </div>
    </div>
  );
};

export default Home;
