import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const Marketplace = () => {
  const allCards = [
    { id: 1, name: 'Rare NFT', image: '/images/nft1.jpg', price: '2 ETH', category: 'art' },
    { id: 2, name: 'Legendary NFT', image: '/images/nft2.jpg', price: '5 ETH', category: 'music' },
    { id: 3, name: 'Epic NFT', image: '/images/nft3.jpg', price: '3 ETH', category: 'sports' },
    { id: 4, name: 'Mythic NFT', image: '/images/nft4.jpg', price: '4 ETH', category: 'art' },
    { id: 5, name: 'Classic NFT', image: '/images/nft5.jpg', price: '1 ETH', category: 'music' },
    { id: 6, name: 'Exclusive NFT', image: '/images/nft6.jpg', price: '6 ETH', category: 'sports' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const filteredCards = allCards.filter(card => 
    (category === '' || card.category === category) &&
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <div className={`${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Marketplace</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Browse and trade NFTs.</p>
          </div>
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-1/4">
            <select 
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="art">Art</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          <div className="w-full md:w-3/4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search NFTs..." 
                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div 
              key={card.id} 
              className={`rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:scale-105 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="relative">
                <img 
                  src={card.image} 
                  alt={card.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                  {card.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{card.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                  }`}>
                    {card.price}
                  </span>
                </div>
                <div className={`flex justify-between items-center pt-3 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <button className={`flex items-center space-x-1 ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <span>Add to favorites</span>
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCards.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No NFTs found</h3>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try changing your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;