import { getOperatorsForType } from '../utils/dataFilter.js';

const NO_VALUE_OPERATORS = new Set(['isEmpty', 'isNotEmpty']);

export default function FilterRow({ filter, headers, columnTypes, onChange, onRemove }) {
  const operators = getOperatorsForType(filter.type);
  const needsValue = !NO_VALUE_OPERATORS.has(filter.operator);
  const needsSecondValue = filter.operator === 'between';

  const inputType =
    filter.type === 'date' ? 'date' : filter.type === 'number' ? 'number' : 'text';

  const handleColumnChange = (event) => {
    const column = event.target.value;
    const nextType = columnTypes[column] || 'text';
    const nextOperators = getOperatorsForType(nextType);

    onChange(filter.id, {
      column,
      type: nextType,
      operator: nextOperators[0].value,
      value: '',
      value2: '',
    });
  };

  const handleOperatorChange = (event) => {
    onChange(filter.id, { operator: event.target.value, value: '', value2: '' });
  };

  return (
    <div className="filter-row">
      <label className="filter-row__field">
        <span className="filter-row__label">Column</span>
        <select
          value={filter.column}
          onChange={handleColumnChange}
          className="input input--select"
        >
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-row__field">
        <span className="filter-row__label">Condition</span>
        <select
          value={filter.operator}
          onChange={handleOperatorChange}
          className="input input--select"
        >
          {operators.map((operator) => (
            <option key={operator.value} value={operator.value}>
              {operator.label}
            </option>
          ))}
        </select>
      </label>

      {needsValue && (
        <label className="filter-row__field">
          <span className="filter-row__label">{needsSecondValue ? 'From' : 'Value'}</span>
          <input
            type={inputType}
            value={filter.value}
            onChange={(event) => onChange(filter.id, { value: event.target.value })}
            className="input"
            placeholder={needsSecondValue ? 'From' : 'Enter value'}
          />
        </label>
      )}

      {needsSecondValue && (
        <label className="filter-row__field">
          <span className="filter-row__label">To</span>
          <input
            type={inputType}
            value={filter.value2}
            onChange={(event) => onChange(filter.id, { value2: event.target.value })}
            className="input"
            placeholder="To"
          />
        </label>
      )}

      <button
        type="button"
        className="btn btn--icon btn--danger"
        onClick={() => onRemove(filter.id)}
        aria-label={`Remove filter on ${filter.column}`}
        title="Remove filter"
      >
        ×
      </button>
    </div>
  );
}