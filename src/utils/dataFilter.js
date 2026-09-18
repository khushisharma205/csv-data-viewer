import { isBlank, sameUtcDay, toNumber, toTimestamp } from './dataUtils.js';

/* ------------------------------------------------------------------ */
/* Operator definitions                                                */
/* ------------------------------------------------------------------ */

export const TEXT_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Does not equal' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

export const NUMBER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'gte', label: 'Greater than or equal' },
  { value: 'lte', label: 'Less than or equal' },
  { value: 'between', label: 'Between' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

export const DATE_OPERATORS = [
  { value: 'equals', label: 'On date' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

export function getOperatorsForType(type) {
  if (type === 'number') return NUMBER_OPERATORS;
  if (type === 'date') return DATE_OPERATORS;
  return TEXT_OPERATORS;
}

/* ------------------------------------------------------------------ */
/* Filter objects                                                      */
/* ------------------------------------------------------------------ */

let filterSequence = 0;

export function createFilter(column, type = 'text') {
  filterSequence += 1;
  return {
    id: `filter-${filterSequence}`,
    column,
    type,
    operator: getOperatorsForType(type)[0].value,
    value: '',
    value2: '',
  };
}

export function isFilterActive(filter) {
  if (!filter) return false;
  if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') return true;
  if (filter.operator === 'between') return !isBlank(filter.value) || !isBlank(filter.value2);
  return !isBlank(filter.value);
}

export function describeFilter(filter, operators) {
  const operatorLabel =
    operators.find((option) => option.value === filter.operator)?.label ?? filter.operator;

  if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
    return `${filter.column}: ${operatorLabel}`;
  }
  if (filter.operator === 'between') {
    return `${filter.column}: ${filter.value || '…'} – ${filter.value2 || '…'}`;
  }
  return `${filter.column}: ${operatorLabel} "${filter.value}"`;
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

function matchNumber(cell, filter) {
  const numericCell = toNumber(cell);
  if (numericCell === null) return false;

  const a = toNumber(filter.value);
  const b = toNumber(filter.value2);

  switch (filter.operator) {
    case 'equals':
      return a !== null && numericCell === a;
    case 'gt':
      return a !== null && numericCell > a;
    case 'lt':
      return a !== null && numericCell < a;
    case 'gte':
      return a !== null && numericCell >= a;
    case 'lte':
      return a !== null && numericCell <= a;
    case 'between': {
      if (a === null && b === null) return true;
      if (a === null) return numericCell <= b;
      if (b === null) return numericCell >= a;
      return numericCell >= Math.min(a, b) && numericCell <= Math.max(a, b);
    }
    default:
      return true;
  }
}

function matchDate(cell, filter) {
  const timeCell = toTimestamp(cell);
  if (timeCell === null) return false;

  const a = toTimestamp(filter.value);
  const b = toTimestamp(filter.value2);

  switch (filter.operator) {
    case 'equals':
      return a !== null && sameUtcDay(timeCell, a);
    case 'before':
      return a !== null && timeCell < a;
    case 'after':
      return a !== null && timeCell > a;
    case 'between': {
      if (a === null && b === null) return true;
      if (a === null) return timeCell <= b;
      if (b === null) return timeCell >= a;
      return timeCell >= Math.min(a, b) && timeCell <= Math.max(a, b);
    }
    default:
      return true;
  }
}

function matchText(cell, filter) {
  const haystack = String(cell).toLowerCase();
  const needle = String(filter.value).toLowerCase();

  switch (filter.operator) {
    case 'contains':
      return haystack.includes(needle);
    case 'notContains':
      return !haystack.includes(needle);
    case 'equals':
      return haystack === needle;
    case 'notEquals':
      return haystack !== needle;
    case 'startsWith':
      return haystack.startsWith(needle);
    case 'endsWith':
      return haystack.endsWith(needle);
    default:
      return true;
  }
}

export function matchesFilter(row, filter) {
  if (!isFilterActive(filter)) return true;

  const raw = row[filter.column];

  if (filter.operator === 'isEmpty') return isBlank(raw);
  if (filter.operator === 'isNotEmpty') return !isBlank(raw);
  if (isBlank(raw)) return false;

  if (filter.type === 'number') return matchNumber(raw, filter);
  if (filter.type === 'date') return matchDate(raw, filter);
  return matchText(raw, filter);
}

/* ------------------------------------------------------------------ */
/* Dataset-level operations                                            */
/* ------------------------------------------------------------------ */

export function filterRows(rows, filters, globalSearch, headers) {
  const activeFilters = filters.filter(isFilterActive);
  const term = (globalSearch || '').trim().toLowerCase();

  if (activeFilters.length === 0 && !term) return rows;

  return rows.filter((row) => {
    for (let i = 0; i < activeFilters.length; i += 1) {
      if (!matchesFilter(row, activeFilters[i])) return false;
    }

    if (term) {
      let found = false;
      for (let i = 0; i < headers.length; i += 1) {
        const value = row[headers[i]];
        if (value && String(value).toLowerCase().includes(term)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }

    return true;
  });
}

function createComparator(sortConfig, columnTypes) {
  const { key, direction } = sortConfig;
  const multiplier = direction === 'desc' ? -1 : 1;
  const type = columnTypes[key] || 'text';

  return (rowA, rowB) => {
    const left = rowA[key];
    const right = rowB[key];

    const leftBlank = isBlank(left);
    const rightBlank = isBlank(right);
    if (leftBlank && rightBlank) return 0;
    if (leftBlank) return 1;
    if (rightBlank) return -1;

    let result = 0;

    if (type === 'number') {
      const a = toNumber(left);
      const b = toNumber(right);
      result = a !== null && b !== null ? a - b : 0;
      if (a === null || b === null) {
        result = String(left).localeCompare(String(right), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
    } else if (type === 'date') {
      const a = toTimestamp(left);
      const b = toTimestamp(right);
      result = a !== null && b !== null ? a - b : 0;
      if (a === null || b === null) {
        result = String(left).localeCompare(String(right), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
    } else {
      result = String(left).localeCompare(String(right), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    }

    return result * multiplier;
  };
}

export function sortRows(rows, sortConfig, columnTypes) {
  if (!sortConfig || !sortConfig.key) return rows;
  return [...rows].sort(createComparator(sortConfig, columnTypes));
}