import Papa from 'papaparse';

export function buildExportFileName(sourceName) {
  const base = String(sourceName || 'dataset').replace(/\.csv$/i, '');
  return `${base}-filtered.csv`;
}

export function exportRowsToCsv(headers, rows, fileName = 'filtered-data.csv') {
  if (!headers.length || !rows.length) return false;

  const data = rows.map((row) => headers.map((header) => row[header] ?? ''));

  const csv = Papa.unparse({ fields: headers, data }, { quotes: false });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  return true;
}