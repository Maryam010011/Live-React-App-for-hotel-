import { useState, FormEvent } from 'react';
import './SearchBar.css';

/**
 * SearchBar Component
 * 
 * This component handles user input for searching hotels by city.
 * 
 * State Management:
 * - city state lives HERE (not in parent) because:
 *   1. It's only needed for this input field's controlled component pattern
 *   2. The parent only needs the final search value when submitted
 *   3. This reduces unnecessary re-renders of parent component
 * 
 * Props:
 * - onSearch: callback function passed from parent to receive search query
 * 
 * Why this component might re-render:
 * 1. When user types (city state changes)
 * 2. When parent re-renders (but won't cause issues due to React optimization)
 */

interface SearchBarProps {
  onSearch: (city: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  // This is controlled component pattern - React controls the input value
  const [city, setCity] = useState('');
  
  /**
   * Handles form submission
   * 
   * @param e - Form event
   * 
   * Steps:
   * 1. Prevent default form submission (which would reload page)
   * 2. Trim whitespace from input
   * 3. Call parent's onSearch callback with the city value
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(city.trim());
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg className="search-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
       
          type="text"
          className="search-input"
          placeholder="Search by city (e.g., New York, Miami)..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <button type="submit" className="search-button">
        Search Hotels
      </button>
    </form>
  );
}

export default SearchBar;
