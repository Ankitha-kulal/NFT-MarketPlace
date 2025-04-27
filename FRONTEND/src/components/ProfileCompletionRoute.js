import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileCompletionRoute = ({ children }) => {
  const { isAuthenticated, loading, profileComplete } = useAuth();
  
  if (loading) {
    return <div className="container center-align" style={{ marginTop: '50px' }}>
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
    </div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If profile is already complete, redirect to explore
  if (profileComplete) {
    return <Navigate to="/explore" replace />;
  }
  
  // Otherwise, show the profile completion page
  return children;
};

export default ProfileCompletionRoute;