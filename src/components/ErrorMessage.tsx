import './ErrorMessage.css';

/**
 * ErrorMessage Component
 * 
 * Displays error messages when API calls fail.
 * This handles the "error" state requirement.
 * 
 * Props:
 * - message: The error message to display
 * - onRetry: Optional callback to retry the failed operation
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
