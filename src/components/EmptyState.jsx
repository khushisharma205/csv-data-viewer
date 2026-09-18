export default function EmptyState({ onUploadClick, onLoadSample }) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      </div>
      <h2 className="empty-state__title">No dataset loaded yet</h2>
      <p className="empty-state__text">
        Upload a CSV file to explore your dataset. Everything is parsed locally in your
        browser — no data leaves your device.
      </p>
      <div className="empty-state__actions">
        <button type="button" className="btn btn--primary" onClick={onUploadClick}>
          Upload CSV
        </button>
        <button type="button" className="btn btn--outline" onClick={onLoadSample}>
          Load Sample CSV
        </button>
      </div>
    </section>
  );
}