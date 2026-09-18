import { useCallback, useRef, useState } from 'react';
import { MAX_FILE_SIZE_LABEL } from '../utils/csvParser.js';
import { formatFileSize } from '../utils/dataUtils.js';

export default function FileUpload({ onFileSelected, loading, fileMeta, warnings }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelected(file);
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const file = event.dataTransfer?.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <section className="file-upload" aria-label="CSV file upload">
      <div
        className={`dropzone${isDragging ? ' dropzone--active' : ''}${
          loading ? ' dropzone--loading' : ''
        }`}
        role="button"
        tabIndex={0}
        aria-label="Drop your CSV file here or browse from your computer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone__icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="dropzone__title">
          {isDragging ? 'Drop your CSV file here' : 'Drop your CSV file here'}
        </p>
        <p className="dropzone__subtitle">or browse from your computer</p>
        <p className="dropzone__hint">
          Accepted file type: <strong>.csv</strong> · Maximum size: <strong>{MAX_FILE_SIZE_LABEL}</strong>
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="dropzone__input"
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {fileMeta && (
        <div className="file-meta" role="status">
          <div className="file-meta__row">
            <span className="file-meta__label">File</span>
            <span className="file-meta__value" title={fileMeta.name}>
              {fileMeta.name}
            </span>
          </div>
          <div className="file-meta__row">
            <span className="file-meta__label">Size</span>
            <span className="file-meta__value">{formatFileSize(fileMeta.size)}</span>
          </div>
          <div className="file-meta__row">
            <span className="file-meta__label">Status</span>
            <span className="badge badge--success">Parsed locally</span>
          </div>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <ul className="warnings" role="status">
          {warnings.map((warning, index) => (
            <li key={index} className="warnings__item">
              {warning}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}