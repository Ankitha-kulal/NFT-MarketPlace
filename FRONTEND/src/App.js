import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';

import Bid from './pages/bid';
import Cart from './pages/cart';
import ChangePassword from './pages/ChangePassword';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import MyCard from './pages/MyCard';
import NFTCollection from './pages/NFTCollection';
import NFTHub from './pages/NFTHub';
import NFTCreate from './pages/NFTCreate';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import ResetPassword from './pages/ResetPassword';
import WalletConnect from './pages/WalletConnect';

import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/nft-collection" element={<NFTCollection />} />
        <Route path="/nft-hub" element={<NFTHub />} />
        <Route path="/nft-create" element={<NFTCreate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/connect" element={<WalletConnect />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/my-card" element={<MyCard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/bid" element={<Bid />} />
        <Route path="/ProfileEdit" element={<ProfileEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
