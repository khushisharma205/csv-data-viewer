export default function LoadingState({ label = 'Processing CSV…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span className="loading-state__label">{label}</span>
    </div>
  );
}