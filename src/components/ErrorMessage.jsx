export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">!</div>
      <p className="error-message__text">{message}</p>
      {onDismiss && (
        <button
          type="button"
          className="btn btn--icon"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}