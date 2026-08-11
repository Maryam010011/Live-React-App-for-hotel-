import './LoadingSpinner.css';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading indicator shown during API calls.
 * This handles the "loading" state requirement.
 * 
 * This is a pure presentational component with no state.
 */

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Finding amazing hotels for you...</p>
    </div>
  );
}

export default LoadingSpinner;
