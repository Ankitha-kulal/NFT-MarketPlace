import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import M from 'materialize-css';

const Navbar = () => {
  useEffect(() => {
    M.AutoInit(); // Initialize Materialize components like dropdowns
  }, []);

  return (
    <nav className="blue darken-3">
      <div className="nav-wrapper container">
        <Link to="/" className="brand-logo">
          <img src="/images/logo.png" alt="Company Logo" style={{ height: '30px', marginRight: '10px' }} />
          Company Name
        </Link>
        <ul className="right">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/Marketplace">Marketplace</Link></li>
          <li><Link to="/my-card">Cards</Link></li>
          <li><Link to="/explore">Explore</Link></li>

          <li><Link to="/cart"><i className="material-icons">shopping_cart</i></Link></li>

          {/* Dropdown Menu for NFT */}
          <li>
            <a className="dropdown-trigger" href="#!" data-target="dropdown-nft">
              NFT <i className="material-icons right">arrow_drop_down</i>
            </a>
            <ul id="dropdown-nft" className="dropdown-content">
              <li><Link to="/nft-hub">NFT Hub</Link></li>
              <li><Link to="/nft-create">NFT Create</Link></li>
              <li><Link to="/nft-collection">NFT Collection</Link></li>
              <li><Link to="/bid">Bid</Link></li>
            </ul>
          </li>

          {/* Dropdown Menu for Account */}
          <li>
            <a className="dropdown-trigger" href="#!" data-target="dropdown-account">
              Account <i className="material-icons right">arrow_drop_down</i>
            </a>
            <ul id="dropdown-account" className="dropdown-content">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/reset-password">Reset Passwords</Link></li>
              <li><Link to="/change-password">Change Password</Link></li>
              <li><Link to="/connect">Connect</Link></li>
              <li><Link to="/Profile">Profile</Link></li>
              <li><Link to="/ProfileEdit">Profile Edit</Link></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
