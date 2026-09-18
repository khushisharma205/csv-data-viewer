import { formatFileSize, formatNumber } from '../utils/dataUtils.js';

export default function DatasetStats({ totalRows, totalColumns, filteredRows, fileSize }) {
  const items = [
    { key: 'rows', label: 'Total Rows', value: formatNumber(totalRows) },
    { key: 'columns', label: 'Columns', value: formatNumber(totalColumns) },
    { key: 'filtered', label: 'Filtered Rows', value: formatNumber(filteredRows) },
    { key: 'size', label: 'File Size', value: fileSize ? formatFileSize(fileSize) : '—' },
  ];

  return (
    <section className="stats" aria-label="Dataset summary">
      {items.map((item) => (
        <div key={item.key} className="stats__card">
          <span className="stats__label">{item.label}</span>
          <span className="stats__value">{item.value}</span>
        </div>
      ))}
    </section>
  );
}