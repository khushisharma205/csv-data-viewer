/* ------------------------------------------------------------------ */
/* Primitive helpers                                                   */
/* ------------------------------------------------------------------ */

export function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

export function toNumber(value) {
  if (isBlank(value)) return null;
  const cleaned = String(value).replace(/,/g, '').trim();
  if (!NUMBER_PATTERN.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const DATE_PATTERNS = [
  /^\d{4}-\d{1,2}-\d{1,2}(?:[T ]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/,
  /^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/,
  /^\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}$/,
  /^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/,
];

export function toTimestamp(value) {
  if (isBlank(value)) return null;
  const text = String(value).trim();

  if (!DATE_PATTERNS.some((pattern) => pattern.test(text))) return null;

  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(text)) {
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const numeric = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (numeric) {
    let first = Number(numeric[1]);
    let second = Number(numeric[2]);
    let year = Number(numeric[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;

    let day = first;
    let month = second;

    if (first <= 12 && second > 12) {
      day = second;
      month = first;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  const fallback = Date.parse(text);
  return Number.isNaN(fallback) ? null : fallback;
}

export function sameUtcDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate()
  );
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(value);
}

/* ------------------------------------------------------------------ */
/* Type inference                                                      */
/* ------------------------------------------------------------------ */

const TYPE_SAMPLE_SIZE = 200;

export function detectColumnTypes(headers, rows) {
  const types = {};
  const sampleSize = Math.min(rows.length, TYPE_SAMPLE_SIZE);

  for (const header of headers) {
    let populated = 0;
    let numeric = 0;
    let dateLike = 0;

    for (let i = 0; i < sampleSize; i += 1) {
      const value = rows[i][header];
      if (isBlank(value)) continue;

      populated += 1;
      if (toNumber(value) !== null) {
        numeric += 1;
      } else if (toTimestamp(value) !== null) {
        dateLike += 1;
      }
    }

    if (populated === 0) {
      types[header] = 'text';
    } else if (numeric / populated >= 0.9) {
      types[header] = 'number';
    } else if ((numeric + dateLike) / populated >= 0.9 && dateLike > 0) {
      types[header] = 'date';
    } else {
      types[header] = 'text';
    }
  }

  return types;
}

/* ------------------------------------------------------------------ */
/* Distinct values                                                     */
/* ------------------------------------------------------------------ */

const DISTINCT_SCAN_LIMIT = 5000;

export function getDistinctValues(rows, header, limit = 100) {
  const seen = new Set();
  let truncated = false;
  const scanSize = Math.min(rows.length, DISTINCT_SCAN_LIMIT);

  for (let i = 0; i < scanSize; i += 1) {
    const value = rows[i][header];
    if (isBlank(value)) continue;

    seen.add(String(value));
    if (seen.size > limit) {
      truncated = true;
      break;
    }
  }

  const values = [...seen].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  return { values, truncated: truncated || rows.length > DISTINCT_SCAN_LIMIT };
}