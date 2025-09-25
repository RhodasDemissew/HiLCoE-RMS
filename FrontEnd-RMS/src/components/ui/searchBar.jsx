import React from 'react';
import { useState } from 'react';


const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  withIcon = true,
  className = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        {withIcon && (
          <div className="absolute left-3 text-gray-400">
             {/* Simple emoji as icon */}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full h-15 rounded-lg border border-gray-300 bg-white px-4 py-2.5 
            text-sm text-gray-900 placeholder-gray-500 transition-all 
            focus:border-blue-500 focus:outline-none focus:ring-2 
            focus:ring-blue-200
            ${withIcon ? 'pl-10' : 'pl-4'}
          `}
          {...props}
        />
      </div>
    </div>
  );
};



export default SearchBar;