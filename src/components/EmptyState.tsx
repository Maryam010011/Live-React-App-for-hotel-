import './EmptyState.css';

/**
 * EmptyState Component
 * 
 * Displays a friendly message when no results are found.
 * This handles the "empty results" state requirement.
 * 
 * Props:
 * - message: The message to display
 * - suggestion: Optional suggestion text for the user
 */

interface EmptyStateProps {
  message: string;
  suggestion?: string;
}

function EmptyState({ message, suggestion }: EmptyStateProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">🏨</div>
      <h3 className="empty-state-title">{message}</h3>
      {suggestion && (
        <p className="empty-state-suggestion">{suggestion}</p>
      )}
    </div>
  );
}

export default EmptyState;
