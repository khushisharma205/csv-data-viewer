import Papa from 'papaparse';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = '25 MB';

const ROW_ID_KEY = '__rowId';

export class CsvError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvError';
  }
}

const GENERIC_ERROR =
  'Unable to read this CSV file. Please verify that the file is valid and try again.';

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateCsvFile(file) {
  if (!file) return 'Please choose a file to upload.';

  const name = file.name || '';
  const mime = (file.type || '').toLowerCase();
  const hasCsvExtension = /\.csv$/i.test(name);
  const hasCsvMime = mime === 'text/csv' || mime === 'application/csv';

  if (!hasCsvExtension && !hasCsvMime) {
    return 'Only .csv files are supported. Please choose a valid CSV file.';
  }
  if (file.size === 0) {
    return 'This file is empty (0 bytes). Please choose a file that contains data.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `This file is larger than the ${MAX_FILE_SIZE_LABEL} limit. Please upload a smaller CSV file.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Header helpers                                                      */
/* ------------------------------------------------------------------ */

function uniqueHeaders(rawHeaders) {
  const used = new Set([ROW_ID_KEY]);

  return rawHeaders.map((raw, index) => {
    const base =
      String(raw ?? '')
        .replace(/\s+/g, ' ')
        .trim() || `Column ${index + 1}`;

    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base} (${suffix})`;
      suffix += 1;
    }
    used.add(candidate);
    return candidate;
  });
}

function isBlankRow(row) {
  return !Array.isArray(row) || row.every((cell) => String(cell ?? '').trim() === '');
}

/* ------------------------------------------------------------------ */
/* Dataset construction                                                */
/* ------------------------------------------------------------------ */

function buildDataset(rawData, warnings = []) {
  const data = (rawData || []).filter((row) => !isBlankRow(row));

  if (data.length === 0) {
    throw new CsvError(
      'This CSV file is empty. Please choose a file that contains a header row and at least one data row.'
    );
  }

  const [headerRow, ...bodyRows] = data;

  if (bodyRows.length === 0) {
    throw new CsvError(
      'This CSV file only contains a header row and no data rows. Please choose a file that contains data.'
    );
  }

  let columnCount = headerRow.length;
  for (const row of bodyRows) {
    if (Array.isArray(row) && row.length > columnCount) {
      columnCount = row.length;
    }
  }

  const rawHeaders = [];
  for (let i = 0; i < columnCount; i += 1) {
    rawHeaders.push(i < headerRow.length ? headerRow[i] : `Column ${i + 1}`);
  }

  const headers = uniqueHeaders(rawHeaders);

  const rows = bodyRows.map((raw, index) => {
    const record = { [ROW_ID_KEY]: index };
    for (let i = 0; i < headers.length; i += 1) {
      const cell = raw[i];
      record[headers[i]] = cell === undefined || cell === null ? '' : String(cell).trim();
    }
    return record;
  });

  return { headers, rows, warnings };
}

function collectWarnings(results) {
  const warnings = [];
  const errors = results?.errors || [];

  const quoteIssues = errors.filter(
    (error) => error?.code === 'Quotes' || error?.code === 'InvalidQuotes'
  ).length;
  if (quoteIssues > 0) {
    warnings.push(
      `${quoteIssues} row(s) contained unbalanced quotes. They were parsed using the best available interpretation.`
    );
  }

  if (errors.some((error) => error?.code === 'UndetectableDelimiter')) {
    warnings.push('The delimiter could not be detected automatically, so a comma was assumed.');
  }

  return warnings;
}

/* ------------------------------------------------------------------ */
/* Public parsing API                                                  */
/* ------------------------------------------------------------------ */

const PARSE_OPTIONS = {
  header: false,
  skipEmptyLines: 'greedy',
  dynamicTyping: false,
};

export function parseCsvText(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new CsvError('This CSV file is empty. Please choose a file that contains data.');
  }

  const results = Papa.parse(text, PARSE_OPTIONS);
  return buildDataset(results.data, collectWarnings(results));
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...PARSE_OPTIONS,
      complete: (results) => {
        try {
          resolve(buildDataset(results.data, collectWarnings(results)));
        } catch (error) {
          reject(error instanceof CsvError ? error : new CsvError(GENERIC_ERROR));
        }
      },
      error: () => reject(new CsvError(GENERIC_ERROR)),
    });
  });
}

export async function loadSampleCsv() {
  const url = `${import.meta.env.BASE_URL}data/shampoo_share_of_shelf.csv`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new CsvError('The sample dataset could not be loaded. Please upload a CSV file instead.');
  }

  if (!response.ok) {
    throw new CsvError('The sample dataset could not be loaded. Please upload a CSV file instead.');
  }

  const text = await response.text();
  const dataset = parseCsvText(text);

  return { ...dataset, size: new Blob([text]).size };
}