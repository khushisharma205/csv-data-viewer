# 📊 CSV Data Viewer

A production-quality, client-side CSV explorer built with **React + Vite** for the
Consterms AI Systems technical interview assignment. Upload any CSV file — the app
detects columns dynamically, renders a professional data table, and lets you search,
filter, sort and paginate through the data. Everything runs 100% in the browser; no
file ever leaves the user's machine.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-csv--data--viewers.onrender.com-blue?style=for-the-badge)](https://csv-data-viewers.onrender.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Papa Parse](https://img.shields.io/badge/Papa%20Parse-5-ff6b35?style=flat-square)](https://www.papaparse.com)

---

## 🌐 Live Demo

**Try it now:** [https://csv-data-viewers.onrender.com](https://csv-data-viewers.onrender.com)

Hosted on **Render** as a Static Site with automatic HTTPS and global CDN delivery.

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Performance](#-performance)
- [Error Handling](#-error-handling)
- [Security & Privacy](#-security--privacy)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Improvements](#-future-improvements)
- [Interview Q&A](#-interview-qa)
- [Demo Checklist](#-demo-checklist)
- [License](#-license)

---

## 🎯 About the Project

This project was built to solve the following assignment:

> "Create a React page that allows users to upload a CSV file and display its data in
> the browser. The page should also provide functionality to filter the data based on
> different columns."

**Key design principle:** The application must work with **any** CSV file — no column
names, no row values, and no CSV structure is hard-coded. The included sample dataset
(`shampoo_share_of_shelf.csv`) is loaded through the same parsing pipeline as a
user-uploaded file.

---

## ✨ Features

### 📁 File Handling
- **Click to upload** or **drag & drop** a CSV file
- Validates `.csv` extension, MIME type, and file size (25 MB limit)
- Replace the current dataset with a new upload without refreshing
- Optional **Load Sample CSV** button for quick demonstration
- Displays selected filename, file size, and parse status

### 🔍 Data Exploration
- **Dynamic column detection** — headers are read from the CSV itself
- **Global search** across every column with instant results
- **Column filters** with type-aware operators:
  - Text: contains, equals, starts with, ends with, is empty
  - Number: equals, greater than, less than, between
  - Date: on, before, after, between
- **Multiple filters** combine with logical AND
- **Active filter count** with individual removal chips
- **Clear all filters** with one click

### 📊 Data Display
- **Sticky table header** for wide datasets
- **Horizontal scrolling** when there are many columns
- **Row numbering** for easy reference
- **Zebra striping** and hover states
- **Truncated long values** with tooltips
- **Empty values** shown as `—` (not blank or "undefined")

### 🔄 Sorting & Pagination
- **Type-aware sorting** — numeric sorts numerically, dates chronologically
- **Three-state sort cycle**: ascending → descending → none
- **Visual sort indicators** (↑ ↓ arrows)
- **Paginated table** with 25 / 50 / 100 rows per page options
- **Range summary**: "Showing 1–25 of 1,284 results"
- **Pagination resets** to page 1 when filters change

### 📈 Statistics Dashboard
- Total rows, columns, filtered rows, and file size
- Updates live as filters change

### 📤 Export
- **Export Filtered CSV** — downloads only the currently visible (filtered) rows
- Correctly escapes commas, quotes, and newlines

### 🎨 UI / UX
- Modern corporate dashboard design
- Responsive layout (desktop, tablet, mobile)
- Clean typography, subtle borders, professional shadows
- No excessive gradients or unnecessary animations
- Keyboard accessible with visible focus rings
- Semantic HTML with ARIA labels

---

## 📸 Screenshots

### Main Dashboard
> Upload area, statistics cards, filter panel, and data table on first load.

### Filtered Results
> Global search combined with multiple column filters, sorted by a numeric column.

### Mobile View
> Collapsible filter panel and horizontally scrollable table on a phone.

*(Add your own screenshots here once you take them — replace this section with `<img>` tags.)*

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI** | React 18 | Modern hooks, functional components |
| **Build** | Vite 5 | Fast dev server, small bundles |
| **CSV Parsing** | Papa Parse 5 | Handles quotes, commas, BOM, errors |
| **Styling** | Vanilla CSS | Full control, no framework overhead |
| **Language** | JavaScript ES2022 | Readable for interviews |
| **Hosting** | Render | Free static site with CDN |

**No unnecessary dependencies.** No Redux, no Tailwind, no routing library — every
tool is justified by the requirements.

---

## 📁 Project Structure
