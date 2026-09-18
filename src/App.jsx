import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Header from './components/Header.jsx';
import FileUpload from './components/FileUpload.jsx';
import DatasetStats from './components/DatasetStats.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import DataTable from './components/DataTable.jsx';
import Pagination from './components/Pagination.jsx';
import EmptyState from './components/EmptyState.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import LoadingState from './components/LoadingState.jsx';

import { CsvError, loadSampleCsv, parseCsvFile, validateCsvFile } from './utils/csvParser.js';
import { detectColumnTypes } from './utils/dataUtils.js';
import {
  createFilter,
  filterRows,
  isFilterActive,
  sortRows,
} from './utils/dataFilter.js';
import { buildExportFileName, exportRowsToCsv } from './utils/csvExport.js';

const DEFAULT_PAGE_SIZE = 25;
const GENERIC_ERROR =
  'Unable to read this CSV file. Please verify that the file is valid and try again.';

export default function App() {
  /* ----------------------------- raw state ----------------------------- */
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileMeta, setFileMeta] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const [filters, setFilters] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fileInputRef = useRef(null);
  const hasData = rows.length > 0;

  /* ---------------------------- derived data --------------------------- */

  const columnTypes = useMemo(() => detectColumnTypes(headers, rows), [headers, rows]);

  const filteredRows = useMemo(
    () => filterRows(rows, filters, globalSearch, headers),
    [rows, filters, globalSearch, headers]
  );

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortConfig, columnTypes),
    [filteredRows, sortConfig, columnTypes]
  );

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, safePage, pageSize]);

  const activeFilterCount = useMemo(() => filters.filter(isFilterActive).length, [filters]);

  const rangeStart = sortedRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, sortedRows.length);

  /* ---------------------------- page resets ---------------------------- */

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, globalSearch, rows]);

  /* ------------------------------ loaders ------------------------------ */

  const applyDataset = useCallback((dataset, meta) => {
    setHeaders(dataset.headers);
    setRows(dataset.rows);
    setWarnings(dataset.warnings || []);
    setFileMeta(meta);
    setFilters([]);
    setGlobalSearch('');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
    setFiltersOpen(false);
    setError(null);
  }, []);

  const loadFromFile = useCallback(
    async (file) => {
      const validationMessage = validateCsvFile(file);
      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const dataset = await parseCsvFile(file);
        applyDataset(dataset, { name: file.name, size: file.size, source: 'upload' });
      } catch (err) {
        setError(err instanceof CsvError ? err.message : GENERIC_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [applyDataset]
  );

  const loadSample = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const dataset = await loadSampleCsv();
      applyDataset(dataset, {
        name: 'shampoo_share_of_shelf.csv',
        size: dataset.size,
        source: 'sample',
      });
    } catch (err) {
      setError(
        err instanceof CsvError
          ? err.message
          : 'The sample dataset could not be loaded. Please upload a CSV file instead.'
      );
    } finally {
      setLoading(false);
    }
  }, [applyDataset]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) loadFromFile(file);
    },
    [loadFromFile]
  );

  /* ------------------------------ sorting ------------------------------ */

  const handleSort = useCallback((key) => {
    setSortConfig((previous) => {
      if (previous.key !== key) return { key, direction: 'asc' };
      if (previous.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' };
    });
  }, []);

  /* ------------------------------ filters ------------------------------ */

  const addFilter = useCallback(() => {
    setFilters((previous) => {
      const usedColumns = new Set(previous.map((filter) => filter.column));
      const nextColumn = headers.find((header) => !usedColumns.has(header)) ?? headers[0];
      if (!nextColumn) return previous;
      return [...previous, createFilter(nextColumn, columnTypes[nextColumn] || 'text')];
    });
    setFiltersOpen(true);
  }, [headers, columnTypes]);

  const updateFilter = useCallback((id, patch) => {
    setFilters((previous) =>
      previous.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter))
    );
  }, []);

  const removeFilter = useCallback((id) => {
    setFilters((previous) => previous.filter((filter) => filter.id !== id));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setGlobalSearch('');
  }, []);

  const toggleFilters = useCallback(() => {
    setFiltersOpen((open) => !open);
  }, []);

  /* ------------------------------ export ------------------------------- */

  const handleExport = useCallback(() => {
    if (!headers.length || sortedRows.length === 0) return;
    const fileName = buildExportFileName(fileMeta?.name);
    exportRowsToCsv(headers, sortedRows, fileName);
  }, [headers, sortedRows, fileMeta]);

  /* ------------------------------ render ------------------------------- */

  return (
    <div className="app">
      <Header
        onUploadClick={openFilePicker}
        onLoadSample={loadSample}
        hasData={hasData}
        loading={loading}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <main className="app-main">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading && <LoadingState />}

        {!loading && !hasData && (
          <>
            <FileUpload
              onFileSelected={loadFromFile}
              loading={loading}
              fileMeta={null}
              warnings={[]}
            />
            <EmptyState onUploadClick={openFilePicker} onLoadSample={loadSample} />
          </>
        )}

        {!loading && hasData && (
          <>
            <FileUpload
              onFileSelected={loadFromFile}
              loading={loading}
              fileMeta={fileMeta}
              warnings={warnings}
            />

            <DatasetStats
              totalRows={rows.length}
              totalColumns={headers.length}
              filteredRows={filteredRows.length}
              fileSize={fileMeta?.size}
            />

            <FilterPanel
              headers={headers}
              columnTypes={columnTypes}
              filters={filters}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              onAddFilter={addFilter}
              onUpdateFilter={updateFilter}
              onRemoveFilter={removeFilter}
              onClearFilters={clearFilters}
              activeCount={activeFilterCount}
              isOpen={filtersOpen}
              onToggle={toggleFilters}
            />

            <section className="results" aria-label="Results">
              <div className="results__header">
                <div className="results__title">
                  <h2>Results</h2>
                  <span className="results__count">
                    {sortedRows.length === 0
                      ? 'No matches'
                      : `${rangeStart}–${rangeEnd} of ${sortedRows.length}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--compact"
                  onClick={handleExport}
                  disabled={sortedRows.length === 0}
                >
                  Export Filtered CSV
                </button>
              </div>

              {sortedRows.length === 0 ? (
                <div className="no-results">
                  <h3 className="no-results__title">No matching records</h3>
                  <p className="no-results__text">
                    Try adjusting or clearing your filters.
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <DataTable
                    headers={headers}
                    rows={pageRows}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    rowOffset={(safePage - 1) * pageSize}
                  />

                  <Pagination
                    currentPage={safePage}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalRows={sortedRows.length}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                </>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          All parsing, filtering and sorting happens locally in your browser. Your CSV
          file is never uploaded to a server.
        </p>
      </footer>
    </div>
  );
}