import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-green-500">
          <div className="flex items-center justify-center">
            <AlertTriangle className="text-green-400 mr-2" size={28} />
            <h1 className="text-2xl font-bold text-green-400">404 Not Found</h1>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 text-center mb-6">The page you are looking for doesn't exist or has been moved.</p>
          
          <div className="bg-gray-800 p-4 rounded-md border-l-4 border-green-500 mb-6">
            <p className="text-gray-300">Please proceed to the login page to access your account.</p>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-300 flex items-center"
              onClick={() => Navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 text-center">
          <p className="text-gray-400 text-sm">© 2025 NFT Marketplace</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;