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
import CompleteProfile from './pages/CompleteProfile';
import VerifyEmail from './pages/verifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ProfileCompletionRoute from './components/ProfileCompletionRoute';
import './index.css';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Profile completion route (auth required, but no complete profile) */}
          <Route path="/complete-profile" element={
            <ProfileCompletionRoute>
              <CompleteProfile />
            </ProfileCompletionRoute>
          } />

          {/* Protected routes (auth required with complete profile) */}
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/nft-collection" element={
            <ProtectedRoute>
              <NFTCollection />
            </ProtectedRoute>
          } />
          <Route path="/nft-hub" element={
            <ProtectedRoute>
              <NFTHub />
            </ProtectedRoute>
          } />
          <Route path="/nft-create" element={
            <ProtectedRoute>
              <NFTCreate />
            </ProtectedRoute>
          } />
          <Route path="/connect" element={
            <ProtectedRoute>
              <WalletConnect />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/my-card" element={
            <ProtectedRoute>
              <MyCard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/bid" element={
            <ProtectedRoute>
              <Bid />
            </ProtectedRoute>
          } />
          <Route path="/ProfileEdit" element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;