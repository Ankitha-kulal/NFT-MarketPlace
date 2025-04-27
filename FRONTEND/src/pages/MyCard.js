import React, { useState, useEffect } from 'react';

const MyCard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const cards = [
    { id: 1, name: 'NFT #1', image: '/api/placeholder/400/300', status: 'Completed' },
    { id: 2, name: 'NFT #2', image: '/api/placeholder/400/300', status: 'Completed' },
    { id: 3, name: 'NFT #3', image: '/api/placeholder/400/300', status: 'Completed' },
    { id: 4, name: 'NFT #4', image: '/api/placeholder/400/300', status: 'Completed' },
    { id: 5, name: 'NFT #5', image: '/api/placeholder/400/300', status: 'Completed' },
    { id: 6, name: 'NFT #6', image: '/api/placeholder/400/300', status: 'Completed' }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Section */}
      <div className={`py-8 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-green-900'}`}>
              NFT Portfolio
            </h1>
            <button 
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
    
          {/* Main Gallery */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                My Collection
              </h2>
              <div className="flex gap-2">
                <button className={`p-2 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className={`p-2 rounded ${isDarkMode ? 'bg-gray-800 text-green-400' : 'bg-green-100 text-green-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div 
                  key={card.id} 
                  className={`rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow'
                  }`}
                >
                  <div className="relative">
                    <img src={card.image} alt={card.name} className="w-full h-48 object-cover" />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800'
                    }`}>
                      {card.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {card.name}
                    </h3>
                    <div className="mt-4 flex justify-between items-center">
                      <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        ID: #{card.id.toString().padStart(4, '0')}
                      </div>
                      <button className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-green-600 hover:bg-green-500 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCard;