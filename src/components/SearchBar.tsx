import { useState, FormEvent, ChangeEvent } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (city: string) => void;
}

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Miami',
  'Houston',
  'San Francisco',
  'Boston',
  'Las Vegas',
  'Seattle',
  'Washington',
  'Toronto',
  'Vancouver',
  'London',
  'Paris',
  'Dubai',
  'Tokyo',
  'Lahore',
  'Islamabad',
  'Karachi',
  'Mumbai',
  'USA',
];

function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setCity(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredCities = cities.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filteredCities);
    setShowSuggestions(true);
  };

  const handleSelectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) return;

    onSearch(trimmedCity);
    setShowSuggestions(false);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon-svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="search-input"
          placeholder="Search by city (e.g., New York, Miami)..."
          value={city}
          onChange={handleChange}
          onFocus={() => {
            if (city.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-item"
                onClick={() => handleSelectCity(suggestion)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="search-button">
        Search Hotels
      </button>
    </form>
  );
}

export default SearchBar;