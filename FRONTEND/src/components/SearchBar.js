// src/components/SearchBar.js
import React from 'react';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="input-field">
      <input type="text" placeholder="Search..." onChange={(e) => onSearch(e.target.value)} />
    </div>
  );
};

export default SearchBar;