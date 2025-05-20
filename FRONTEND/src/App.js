import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'materialize-css/dist/css/materialize.min.css';
import './App.css';

// Context Providers - Import the components directly
import { ProfileContext, ProfileProvider } from './context/ProfileContext';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
// import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import NFTHub from './pages/NFTHub';
import NFTCreate from './pages/NFTCreate';
import NFTDetail from './pages/NFTDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AuthCallback from './components/AuthCallback';
import Marketplace from './pages/Marketplace';
import Explore from './pages/Explore';
import MyCard from './pages/MyCard';
import ResetPassword from './pages/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';
import ProfileEdit from './pages/ProfileEdit';
// import NFTCollection from './pages/NFTCollection';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="container center-align" style={{ marginTop: '100px' }}>
        <div className="preloader-wrapper big active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
            <div className="gap-patch">
              <div className="circle"></div>
            </div>
            <div className="circle-clipper right">
              <div className="circle"></div>
            </div>
          </div>
        </div>
        <h4>Loading...</h4>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    toast.info("Please log in to access this page");
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the protected component
  return children;
};

// Routes component to avoid context provider issues
const AppRoutes = () => {
  const { isInitialized, checkUserSession } = useAuth();
  
  // Check for session when app loads
  useEffect(() => {
    if (isInitialized) {
      checkUserSession();
    }
  }, [isInitialized, checkUserSession]);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route path="/nft-hub" element={
              <ProtectedRoute>
                <NFTHub />
              </ProtectedRoute>
            } />
            <Route path="/complete-profile" element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } />
            <Route path="/nft/create" element={
              <ProtectedRoute>
                <NFTCreate />
              </ProtectedRoute>
            } />
             {/* <Route path="/nft-collection" element={
              <ProtectedRoute>
                <NFTCollection />
              </ProtectedRoute>
            } /> */}
            <Route path="/Marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
              <Route path="/explore" element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } />
              <Route path="/my-card" element={
              <ProtectedRoute>
                <MyCard />
              </ProtectedRoute>
            } />
            
            <Route path="/nft/:id" element={
              <ProtectedRoute>
                <NFTDetail />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
             <Route path="/ProfileEdit" element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            } />
             <Route path="/reset-password" element={
              <ProtectedRoute>
                <ResetPassword />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {/* <Footer /> */}
      </div>
      <ToastContainer position="bottom-right" />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <ProfileProvider>
          <AppRoutes />
        </ProfileProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;