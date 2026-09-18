# CSV Data Viewer

A production-quality, client-side CSV explorer built with **React + Vite** for the
Consterms AI Systems technical interview assignment.

Upload any CSV file — the app detects its columns dynamically, renders a data table,
and lets you search, filter, sort and paginate through the data. Everything runs
100% in the browser; no file ever leaves the user's machine.

---

## Overview

- Upload a `.csv` file (click or drag & drop)
- Parse it locally with **Papa Parse**
- Auto-detect headers, normalise rows, infer column types
- Display the dataset in a professional, sticky-header table
- Filter by **any** column (text / number / date aware)
- Global search across all columns
- Sortable columns (numeric, date, and text sorts)
- Pagination (25 / 50 / 100 rows per page)
- Live dataset statistics (rows, columns, filtered rows, file size)
- Export the filtered view back to CSV
- Graceful empty states and human-readable error messages
- Fully responsive, keyboard accessible, semantic HTML

---

## Interview Assignment

> Create a React page that allows users to upload a CSV file and display its data in the
> browser. The page should also provide functionality to filter the data based on
> different columns.

This repository implements that brief with a focus on **dynamic CSV support** — no
column names or row values are hard-coded. The included
`shampoo_share_of_shelf.csv` sample is loaded through the same parsing pipeline as any
uploaded file.

---

## Features

- Drag-and-drop or click-to-upload CSV area
- `.csv` and file-size validation (25 MB limit)
- Papa Parse powered parsing with quoted-field support
- Duplicate header disambiguation (`name`, `name (2)`, …)
- Ragged-row normalisation
- Automatic column type inference (number / date / text)
- Column filters with type-appropriate operators
- Global search combined with column filters (logical AND)
- Multi-column filters
- Sort by clicking a header (asc → desc → none)
- Sticky table header, horizontal scroll for wide tables
- Row numbering, zebra striping, hover state, empty-value placeholder
- Compact statistics dashboard that updates with filters
- Client-side CSV export of the filtered rows
- Responsive layout (desktop / tablet / mobile)
- Accessible controls with visible focus rings

---

## Technology Stack

- **React 18** (functional components + hooks)
- **Vite 5** (fast dev server and build)
- **Papa Parse 5** (CSV parser)
- **Plain modern CSS** with custom properties (no CSS framework)
- **JavaScript (ES2022)** — no TypeScript, keeps the demo easy to read

---

## Project Structure

```
csv-data-viewer/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── public/
│   └── data/
│       └── shampoo_share_of_shelf.csv
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── Header.jsx
    │   ├── FileUpload.jsx
    │   ├── DatasetStats.jsx
    │   ├── FilterPanel.jsx
    │   ├── FilterRow.jsx
    │   ├── DataTable.jsx
    │   ├── Pagination.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorMessage.jsx
    │   └── LoadingState.jsx
    ├── utils/
    │   ├── csvParser.js
    │   ├── dataFilter.js
    │   ├── dataUtils.js
    │   └── csvExport.js
    └── styles/
        ├── index.css
        └── app.css
```

---

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open http://localhost:5173

## Production Build

```bash
npm run build
```

Output is written to `dist/`.

## Preview Production Build

```bash
npm run preview
```

---

## How It Works

1. **CSV upload** — the user picks a file or drags it onto the dropzone. The file is
   validated for extension, non-empty content and size before anything else.
2. **Parsing** — `Papa.parse` reads the file with `header: false` so we control the
   header normalisation. Errors are converted into short, human-readable messages.
3. **Data normalisation** — the first non-blank row becomes the header row. Duplicate
   headers get a numeric suffix. Every body row is padded/truncated so it always has
   exactly one value per header, and empty cells are stored as `''`.
4. **Filtering** — every active filter is evaluated against the row. Filters are
   combined with logical AND. The global search runs across all columns and is also
   ANDed with column filters.
5. **Sorting** — a comparator is chosen based on the detected type of the sorted
   column. Numbers compare numerically, dates compare by timestamp, text compares
   locale-aware. Blank values always sort last.
6. **Pagination** — the sorted, filtered array is sliced. Page size can be 25/50/100.
   Page resets to 1 whenever filters or the dataset change.
7. **Rendering** — the table is rendered from the visible page only. Derived data
   (types, filtered rows, sorted rows, page rows) is memoised with `useMemo`.

---

## Architecture

- `App.jsx` owns the raw state (`headers`, `rows`, `filters`, `globalSearch`,
  `sortConfig`, `currentPage`, `pageSize`, `loading`, `error`) and derives everything
  else with `useMemo`. Derived data is never stored in state.
- `Header.jsx` — brand, upload button, sample button.
- `FileUpload.jsx` — drag-and-drop area plus metadata display. Stateless except for a
  local `isDragging` flag.
- `DatasetStats.jsx` — presentational grid of statistics.
- `FilterPanel.jsx` — global search, add/clear filters, mobile drawer toggle.
- `FilterRow.jsx` — one filter: column select, operator select, 1–2 value inputs.
- `DataTable.jsx` — sortable header row plus the visible page of rows. Fully driven
  by `headers` so any CSV works.
- `Pagination.jsx` — range summary, page-size select, page buttons.
- `EmptyState.jsx`, `ErrorMessage.jsx`, `LoadingState.jsx` — small presentational
  components for the three non-happy paths.
- `utils/csvParser.js` — validation, Papa Parse wrapper, sample loader.
- `utils/dataUtils.js` — type coercion, type inference, formatting helpers.
- `utils/dataFilter.js` — operator definitions, per-row matching, filter + sort.
- `utils/csvExport.js` — escape-safe CSV export using `Papa.unparse`.

---

## Performance Considerations

- Filtering, sorting and pagination are memoised.
- Only the visible page (25/50/100 rows) is rendered into the DOM.
- Type inference samples at most 200 rows per column.
- Distinct-value scans cap at 5000 rows to keep dropdown generation cheap.
- State is split so typing into a filter input only re-renders the filter panel,
  not the entire table.

## Error Handling

The parser normalises every failure mode into a friendly message:

- non-CSV file
- empty file / empty CSV / header-only CSV
- oversized file
- malformed rows / unbalanced quotes
- duplicate header names
- unexpected column counts

No raw stack traces are shown to the user.

## Security & Privacy

- CSV contents are **never** sent to a server. Parsing happens entirely in the
  browser using the `FileReader`/`Blob` APIs underneath Papa Parse.
- Cell values are rendered through React's standard text nodes, so HTML and
  JavaScript embedded in a CSV (including values starting with `=`, `+`, `-`, `@`)
  are displayed as plain text and never executed.
- No `dangerouslySetInnerHTML` is used anywhere.
- Exported CSVs are generated locally and downloaded with `URL.createObjectURL`.

## Browser Compatibility

Tested with modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses
`Intl.NumberFormat`, `URL.createObjectURL`, `Blob`, `FileReader` and
`structuredClone`-free code paths — all widely supported.

## Future Improvements

- Column-level visibility toggles
- Saved filter presets (URL hash synchronisation)
- Virtualised rendering (e.g. `@tanstack/react-virtual`) for > 100k rows
- Server-side filtering / pagination for very large datasets
- Light / dark theme toggle
- Unit tests with Vitest + React Testing Library

## Interview Discussion Points

**Why Papa Parse?**
It is battle-tested, handles quoting, embedded commas/newlines and BOM, exposes
row-level errors, and works in the browser with both files and strings. It saves us
from writing a fragile CSV tokenizer.

**Why `useMemo`?**
Filtering and sorting the full dataset are the heaviest operations in the app.
Memoising them on the exact dependencies (`rows`, `filters`, `globalSearch`,
`sortConfig`, `columnTypes`) means typing in a filter input does not recompute
unrelated work and does not trigger unnecessary re-renders of the table.

**How does filtering work?**
Every active filter is stored as an object `{ column, operator, value, value2 }`.
`filterRows` iterates the dataset once, applying every active filter (logical AND)
and then the global search term. The result is memoised and handed to the sorter.

**How would you handle a 500 MB CSV?**
Stream it with Papa Parse's `step`/`chunk` mode, keep only the visible window of
rows in state, and push filtering/sorting to a Web Worker. Pagination becomes
mandatory, and virtualisation would be used on the table body.

**How would you implement server-side filtering?**
Debounce the filter state, translate the filter objects into a query string, call
the backend, and use the returned page as the table's data source. The UI stays
identical — only the data provider changes.

**How would you test this application?**
Unit tests for `utils/` (parsing, type inference, filter matching, sorting, export
escaping). Component tests with React Testing Library for FileUpload, FilterPanel
and DataTable. A small Cypress/Playwright smoke test that uploads a fixture CSV and
asserts the table updates as filters change.

**How would you improve accessibility?**
Add `aria-describedby` on each filter input, live-region announcements when the
result count changes, focus management when a filter is added/removed, and
high-contrast colour tokens.

**How would you virtualise a large table?**
Replace the `<tbody>` rendering with `@tanstack/react-virtual` (or a hand-rolled
windowed list), keeping the sticky header and using absolute-positioned rows inside
a scroll container. Papa Parse chunk mode combined with virtualisation would let the
app handle millions of rows.

---

## Interview Demo Checklist

1. Run `npm install` then `npm run dev`, open http://localhost:5173.
2. Explain the goal: client-side CSV viewer, everything local.
3. Click **Load Sample CSV** → the shampoo dataset loads with all 27 columns
   auto-detected.
4. Point out the statistics cards: total rows, columns, filtered rows, file size.
5. Type `mumbai` into the global search — the table narrows instantly.
6. Click **+ Add Filter** → set **Region = West** and **Brand = Dove**.
   Show that both filters apply together with the search.
7. Click the **share_of_shelf_pct** column header twice to show numeric sort
   asc/desc (verify 5 → 10 → 100 ordering, not alphabetical).
8. Change **Rows per page** to 50 and click **Next**.
9. Click **Clear Filters** — the full dataset returns.
10. Click **Export Filtered CSV** to show the download.
11. Replace the CSV by dropping a different file onto the dropzone.
12. Briefly explain the architecture: `App.jsx` owns raw state, derived values are
    memoised, parsing/filtering utilities live in `src/utils/`.#   c s v - d a t a - v i e w e r  
 