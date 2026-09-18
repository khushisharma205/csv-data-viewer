export default function DataTable({
  headers,
  rows,
  sortConfig,
  onSort,
  rowOffset,
}) {
  if (rows.length === 0) return null;

  const renderSortIcon = (header) => {
    if (sortConfig.key !== header) {
      return <span className="table__sort-icon table__sort-icon--idle" aria-hidden="true">↕</span>;
    }
    return (
      <span className="table__sort-icon table__sort-icon--active" aria-hidden="true">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead className="table__head">
          <tr>
            <th scope="col" className="table__cell table__cell--index">
              #
            </th>
            {headers.map((header) => {
              const isSorted = sortConfig.key === header;
              return (
                <th
                  key={header}
                  scope="col"
                  className={`table__cell table__cell--header${
                    isSorted ? ' table__cell--sorted' : ''
                  }`}
                  aria-sort={
                    isSorted
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="table__sort-btn"
                    onClick={() => onSort(header)}
                    title={`Sort by ${header}`}
                  >
                    <span className="table__header-label">{header}</span>
                    {renderSortIcon(header)}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.__rowId ?? index} className="table__row">
              <td className="table__cell table__cell--index">{rowOffset + index + 1}</td>
              {headers.map((header) => {
                const value = row[header];
                const isEmpty = value === undefined || value === null || value === '';
                return (
                  <td key={header} className="table__cell" title={isEmpty ? '' : String(value)}>
                    {isEmpty ? <span className="table__empty">—</span> : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}