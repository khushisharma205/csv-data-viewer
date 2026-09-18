import FilterRow from './FilterRow.jsx';

export default function FilterPanel({
  headers,
  columnTypes,
  filters,
  globalSearch,
  onGlobalSearchChange,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  onClearFilters,
  activeCount,
  isOpen,
  onToggle,
}) {
  return (
    <section className="filter-panel" aria-label="Filters and search">
      <div className="filter-panel__toolbar">
        <div className="filter-panel__search">
          <span className="filter-panel__search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            className="input input--search"
            placeholder="Search across all columns..."
            value={globalSearch}
            onChange={(event) => onGlobalSearchChange(event.target.value)}
            aria-label="Search across all columns"
          />
          {globalSearch && (
            <button
              type="button"
              className="filter-panel__clear-search"
              onClick={() => onGlobalSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-panel__actions">
          <button
            type="button"
            className="btn btn--outline filter-panel__toggle"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls="filter-panel-body"
          >
            Filters
            {activeCount > 0 && <span className="badge badge--count">{activeCount}</span>}
          </button>
          <button type="button" className="btn btn--outline" onClick={onAddFilter}>
            + Add Filter
          </button>
          {activeCount > 0 && (
            <button type="button" className="btn btn--ghost" onClick={onClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div
        id="filter-panel-body"
        className={`filter-panel__body${isOpen ? ' filter-panel__body--open' : ''}`}
      >
        {filters.length === 0 ? (
          <p className="filter-panel__empty">
            No column filters applied. Use <strong>+ Add Filter</strong> to filter by any column.
          </p>
        ) : (
          <div className="filter-panel__rows">
            {filters.map((filter) => (
              <FilterRow
                key={filter.id}
                filter={filter}
                headers={headers}
                columnTypes={columnTypes}
                onChange={onUpdateFilter}
                onRemove={onRemoveFilter}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}