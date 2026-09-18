import { formatNumber } from '../utils/dataUtils.js';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const list = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const withEllipsis = [];
  for (let i = 0; i < list.length; i += 1) {
    if (i > 0 && list[i] - list[i - 1] > 1) {
      withEllipsis.push('…');
    }
    withEllipsis.push(list[i]);
  }

  return withEllipsis;
}

export default function Pagination({
  currentPage,
  pageCount,
  pageSize,
  totalRows,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}) {
  const pages = buildPageList(currentPage, pageCount);

  return (
    <div className="pagination" role="navigation" aria-label="Table pagination">
      <div className="pagination__info">
        Showing <strong>{formatNumber(rangeStart)}</strong>–
        <strong>{formatNumber(rangeEnd)}</strong> of{' '}
        <strong>{formatNumber(totalRows)}</strong> results
      </div>

      <div className="pagination__controls">
        <label className="pagination__size">
          <span className="pagination__size-label">Rows per page</span>
          <select
            className="input input--select input--compact"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="pagination__pages">
          <button
            type="button"
            className="btn btn--outline btn--compact"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>

          {pages.map((page, index) =>
            page === '…' ? (
              <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={`btn btn--page${
                  page === currentPage ? ' btn--page-active' : ''
                }`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            className="btn btn--outline btn--compact"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}