# Costco Receipt Dashboard - README

![Version](https://img.shields.io/badge/version-0.5.5-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

A client-side web application for visualizing, searching, and analyzing Costco digital receipt data (`.json`). This dashboard transforms raw JSON exports into a highly readable, interactive ledger with financial breakdowns, tax auditing, and spending analytics.

### 🚀 Current State

The project has evolved from a simple list viewer into a robust financial audit tool. It features a "Dual-Mode" rendering engine that switches between a **History View** (_grouped by shopping trip_) and a **Search View** (_flat item list_) for granular filtering.

---
  ## 🚀 Quick Start
  
  1. If you do not have your Costco Receipt File... visit our **[Costco Receipt Downloader](https://github.com/TechStud/TCRDD/blob/main/Downloader)** to get started.
  2. Once you have your Costco Receipt File, visit our **[Live Costco Dashboard](https://TechStud.github.io/TCRDD/Dashboard/)**
---

### ✨ Key Features

#### 1. Advanced Data Parsing
* **Timezone Agnostic:** Custom date parsers strictly respect the local time printed on the receipt (avoiding browser timezone shifts).
* **Smart Tax Engine:**
    * Reads root receipt taxes for accurate totals.
    * Maps distinct tax codes (e.g., "H" for HST, "G" for GST) from the `subTaxes` object to individual line items.
    * **Taxable Basis Logic:** Distinguishes between **TPD** (Store Discounts, taxed on net) and **CPN** (Manufacturer Coupons, taxed on original price).
* **Unit Conversion:** Automatically detects weighted items (Meat/Deli/Produce) and calculates:
    * Imperial (lb) vs Metric (kg) based on `warehouseCountry`.
    * Effective Unit Price (visualizing cost-per-unit after discounts).

#### 2. User Interface & Experience
* **Drag & Drop Import:** Browser-based file ingestion (no server upload required) for security and speed.
* **Dual-Mode Visualization:**
    * **History Mode:** Groups items under "Receipt Headers" (Blue for Sales, Red for Refunds) showing date, warehouse, item count, and trip totals.
    * **Search Mode:** Flattens the hierarchy to show individual results with context metadata (Date/Warehouse) attached to the row.
* **Infinite Scroll / Lazy Loading:** Renders receipts in batches of 20 to maintain 60fps performance with large datasets (thousands of items).

#### 3. Item "Ledger" Layout (CSS Grid)
Individual item rows utilize a strict 4-column CSS Grid layout for perfect vertical alignment:
1.  **Item Info:** Description, Badge (Markdown/Refund), Item #.
2.  **Units:** Displays Qty or Weight (with strike-through logic for discounted unit prices).
3.  **Price Math:** Visually stacks `Original Price`, `Saved Badge`, and `Net Price`.
4.  **Finals:** Visually stacks `Tax Details` (calculated rate + amount) and `Final Cost`.

#### 4. Filtering & Search
* **Interactive Badges:** Filter by **Refunds**, **Markdowns** (items ending in .97), and **Discounts**.
* **Contextual Date Picker:** Dynamically populated dropdown containing only dates present in the dataset.
* **Fuzzy Search:** Instant filtering by Item Description, Warehouse Name, or Item Number.

### 🛠 Technical Stack
* **Core:** Vanilla JavaScript (ES6+).
* **Styling:** Bootstrap 5.3 + Custom CSS Grid/Flexbox.
* **Visualization:** Chart.js for "Top Spending" analytics.
* **Localization:** `Intl.NumberFormat` for dynamic currency handling (USD/CAD) based on receipt origin.

---

### 📋 Complete Changelog

* **v0.5.5 (Current):**
   * Enhancing styles and improving filter functionality. 
   * Adjusted layout and added drag-and-drop support for file uploads.
   * Adjusted Receipt layout and rendering logic for better (UX) user experience.
* **v0.5.2:**
    * Refined `price-tax-detail` layout (flipped order with Final Price).
    * Dynamic Tax Sign logic (suppresses double negatives on refunds).
    * Moved "Saved" badge to sit inline with Price for better scanning.
    * Standardized font sizes across the "Receipt Header" bar.
* **v0.5.1:** Fixed CSS Grid alignment issues by enforcing container rendering for empty data cells.
* **v0.5.0:** Implemented "Horizontal Spread" layout for pricing math.
* **v0.4.0:** Introduced Department Gating to prevent false-positive weight calculations on hardware items.
* **v0.3.0:** * Switched Item Rows from Table Cells to **CSS Grid** for strict alignment.
    * Added **Markdown detection** (.97 logic) with purple badges.
    * Implemented Imperial/Metric dual display for Canadian warehouses.
* **v0.2.0:** * **Major Architecture Overhaul:** Switched from a Flat List to "Grouped History" view.
    * Added Receipt Header bars (Sales vs Refunds).
    * Implemented **Lazy Loading** (Infinite Scroll) for performance.
    * Added Date Picker and Timezone-agnostic parsing.
* **v0.1.0:** * Complete rewrite from jQuery to Vanilla JS & Bootstrap 5.
    * Added **Drag & Drop** file zone.
    * Fixed core financial accuracy by reading root totals instead of line sums.
* **v0.0.1 (Legacy):** Initial prototype using jQuery. Basic file parsing and bar chart visualization.

### 🔮 Future Roadmap
* *Potential:* Export filtered views to CSV.
* *Potential:* Year-over-Year comparison charts.
