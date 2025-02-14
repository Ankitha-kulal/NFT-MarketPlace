
// src/components/Filter.js
import React from 'react';

const Filter = ({ options, onFilterChange }) => {
  return (
    <div>
      <label>Filter by:</label>
      <select onChange={(e) => onFilterChange(e.target.value)}>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
