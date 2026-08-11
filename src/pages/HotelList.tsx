import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel } from '../types/hotel';
import { fetchHotels } from '../services/hotelService';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import './HotelList.css';

/**
 * HotelList Page Component
 * 
 * This page displays a list of hotels based on search criteria.
 * It demonstrates all three required states: loading, error, and empty results.
 * 
 * State Management (WHY state lives here):
 * 
 * 1. hotels - Lives HERE because:
 *    - This component is responsible for fetching and displaying hotel data
 *    - Child components (HotelCard) only need to display data, not manage it
 *    - Keeping it here allows easy filtering and sorting without prop drilling
 * 
 * 2. loading - Lives HERE because:
 *    - This component initiates the API call
 *    - We need to show loading state while waiting for the API
 *    - Child components don't need to know about loading state
 * 
 * 3. error - Lives HERE because:
 *    - This is where the API call can fail
 *    - Error handling is centralized in this component
 *    - We can display error messages at the page level
 * 
 * Why this component re-renders:
 * 1. When searchParams change (user searches or filters)
 * 2. When hotels state updates (after API call)
 * 3. When loading state changes (API call starts/ends)
 * 4. When error state changes (API call fails)
 * 
 * These re-renders are intentional and necessary to show updated data.
 */
function HotelList() {
  // Get search parameters from URL
  // useSearchParams returns [searchParams, setSearchParams]
  // We only need the getter here, so we use just the first element
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract city from URL query params
  const cityParam = searchParams.get('city') || '';
  
  // State declarations - all state that changes based on user interaction or API calls
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetches hotels from the API
   * This is a separate function so we can call it both:
   * 1. On component mount (useEffect)
   * 2. When user retries after an error
   */
  const loadHotels = async (city: string) => {
    try {
      // Set loading state before API call
      setLoading(true);
      // Clear any previous errors
      setError(null);
      
      // Call the API service
      const data = await fetchHotels(city);
      
      // Update state with fetched data
      setHotels(data);
    } catch (err) {
      // Handle errors and set error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to load hotels';
      setError(errorMessage);
    } finally {
      // Always set loading to false, whether success or error
      setLoading(false);
    }
  };
  
  /**
   * useEffect hook - runs when cityParam changes
   * 
   * Why we use useEffect:
   * - We need to fetch data when the component mounts
   * - We need to re-fetch when the search parameter changes
   * - API calls are side effects (external interactions)
   * 
   * Dependency array [cityParam]:
   * - Effect runs when cityParam changes
   * - This happens when user searches or URL changes
   */
  useEffect(() => {
    loadHotels(cityParam);
  }, [cityParam]);
  
  /**
   * Handles new search from the SearchBar
   * Updates URL query params, which triggers useEffect
   */
  const handleSearch = (city: string) => {
    if (city) {
      setSearchParams({ city });
    } else {
      setSearchParams({});
    }
  };
  
  /**
   * Retry handler for error state
   * Simply re-runs the loadHotels function
   */
  const handleRetry = () => {
    loadHotels(cityParam);
  };
  
  return (
    <div className="hotel-list-page">
      <section className="search-header">
        <div className="container">
          <h1 className="page-title">Find Your Perfect Hotel</h1>
          <SearchBar onSearch={handleSearch} />
          {cityParam && (
            <p className="search-info">
              Showing results for: <strong>{cityParam}</strong>
            </p>
          )}
        </div>
      </section>
      
      <section className="hotel-list-section">
        <div className="container">
          {/* LOADING STATE - shown while fetching data */}
          {loading && <LoadingSpinner />}
          
          {/* ERROR STATE - shown when API call fails */}
          {!loading && error && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}
          
          {/* EMPTY STATE - shown when no results found */}
          {!loading && !error && hotels.length === 0 && (
            <EmptyState 
              message="No hotels found" 
              suggestion="Try searching for a different city or browse all hotels"
            />
          )}
          
          {/* SUCCESS STATE - shown when we have data */}
          {!loading && !error && hotels.length > 0 && (
            <>
              <div className="results-summary">
                Found <strong>{hotels.length}</strong> {hotels.length === 1 ? 'hotel' : 'hotels'}
              </div>
              <div className="hotel-grid">
                {hotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default HotelList;
