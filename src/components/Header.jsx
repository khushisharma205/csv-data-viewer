export default function Header({ onUploadClick, onLoadSample, hasData, loading }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo" aria-hidden="true">
          CSV
        </div>
        <div>
          <h1 className="app-header__title">CSV Data Viewer</h1>
          <p className="app-header__subtitle">
            Explore, filter and analyze your CSV data — entirely in your browser.
          </p>
        </div>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onLoadSample}
          disabled={loading}
        >
          {hasData ? 'Reload Sample' : 'Load Sample CSV'}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onUploadClick}
          disabled={loading}
        >
          {hasData ? 'Replace CSV' : 'Upload CSV'}
        </button>
      </div>
    </header>
  );
}