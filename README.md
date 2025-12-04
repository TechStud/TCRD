# TechStud's Costco Receipt Downloader (TCRD)

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**TCRD** is a client-side JavaScript tool that automates the process of retrieving, formatting, and archiving your Costco in-warehouse receipts.

It runs directly in your web browser to fetch up to **3 years** of receipt history, export it to a data-rich JSON format, and intelligently merge new data with your existing archives to prevent duplicates.

---

## 🌟 Features

* **📅 Historical Data:** Fetches the maximum allowed history (currently 3 years) from your Costco account.
* **🧠 Smart Merging:** Capable of reading your *previous* download file and only fetching/adding new receipts.
* **👨‍👩‍👧‍👦 Multi-Member Support:** Have a spouse or family member on a separate login? You can merge their receipts into your main file to create a single household archive.
* **💾 Data-Rich Export:** Saves detailed transaction data (Items, Prices, Locations, Member IDs) in structured JSON format.
* **🛡️ Duplicate Protection:** Automatically detects and removes duplicate entries based on Transaction Barcodes.
* **🔒 Privacy Focused:** Runs entirely in *your* browser. No data is sent to the author or any third-party servers.

---

## 🚀 How to Use (Step-by-Step)

### Prerequisites
* A desktop computer (Windows, Mac, or Linux).
* A modern web browser (Google Chrome, Microsoft Edge, Brave, etc.).
* An active Costco.com (or regional equivalent) account.

### Instructions

**1. Log In to your Costco Account**
Go to your regional Costco website (e.g., [Costco.ca](https://www.costco.ca), [Costco.com](https://www.costco.com), ...) and log in to your account.

**2. Navigate to Orders & Returns -> In-Warehouse**
Click on **Orders & Returns** in the top menu, then select the tab labeled **In-Warehouse**.
> *Note: You must be on this specific page for the script to work.*

**3. Open the Developer Console**
This is the "Matrix" view of your browser. Don't worry, it's safe!
* **Windows/Linux:** Press `F12` or `Ctrl` + `Shift` + `I`
* **Mac:** Press `Cmd` + `Option` + `I`
* *Then, click on the tab at the top labeled **"Console"**.*

**4. Run the Script**
Copy the entire code from `costco_receipt_downloader.js` in this repository. Paste it into the Console area and press **Enter**.

**5. Choose Your Action**
Look at the bottom-right corner of the Costco webpage. You will see two new buttons:

* **Option A: Start Fresh (No File)**
    * Click this if it is your **first time** running the tool.
    * It will fetch all available history (up to 3 years) and save a new file.

* **Option B: Load Existing Receipt File**
    * Click this if you have run this tool before and want to merge new receipts into your existing file.
    * Select your previously saved `Costco_In-Warehouse_Receipts.json` file.
    * The script will load your old data, fetch *only* what is new, merge them together, and let you save an updated master file.

* **NOTE:** If no button is selected within 30 seconds, the script will default to Option B and continue.

---

## 📂 File Output & Naming

The script automatically generates filenames based on the data found:

* **Single Account:** `Costco_In-Warehouse_Receipts_123456789.json` (Includes Member ID)
* **Multiple Accounts:** `Costco_In-Warehouse_Receipts_2-Members.json` (If you merged data from two different cards).

**Note on Saving:**
* **Chrome/Edge:** A "Save As" window will pop up, allowing you to overwrite your old file if you choose.
* **Firefox/Safari:** The file will automatically download to your "Downloads" folder. You may need to manually delete the old version.
* 💡 **TIP:** All browsers have an option to open the Save File dialog interface when downloading files by default. If not enabled, you may simply need to enable it... In your browser go to: Settings -> Downloads -> Enable the related 'Ask where to save each file before downloading' option.

---
## ⚠️ Privacy & Liability Disclaimer
* **Sensitive Data:** The downloaded JSON file contains your shopping history, partial payment information, and membership numbers. Keep this file secure. Do not share it publicly.
* **Terms of Use:** This script is an unofficial tool for personal archiving. It is not endorsed by Costco Wholesale Corporation.
* **Liability:** The author (TechStud) is not responsible for any data discrepancies, missed receipts, or account limitations imposed by Costco. Use at your own risk.

---
## 🤓 For Advanced Users

### The Merging Logic
The script uses a composite key of `MembershipNumber` + `TransactionBarcode` to identify unique receipts.
1.  **Ingest:** Loads the JSON provided by the user.
2.  **Fetch:** Scrapes the API for the last 3 years of data.
3.  **Merge:** Combines arrays.
4.  **Dedupe:** Iterates through the merged list. If a conflict is found, it prioritizes the *existing* local data (assuming you may have manually edited it), though usually, the data is identical.

### JSON Structure
The output is a array of objects. Example:
```json
[
  {
    "documentType": "WarehouseReceiptDetail",
    "receiptType": "In-Warehouse",
    "membershipNumber": "123456789012"
    "transactionType": "Sales",
    "transactionDateTime": "2023-10-25T14:30:00",
    "transactionDate": "2023-10-25",
    "warehouseShortName": "SEATTLE",
    "warehouseNumber": 1,
    "warehouseName": "SEATTLE",
    "warehouseAddress1": "4401 4TH AVE S",
    "warehouseAddress2": null,
    "warehouseCity": "SEATTLE",
    "warehouseState": "WA",
    "warehouseCountry": "US",
    "warehousePostalCode": "98134-2311",
    "companyNumber": 1,
    "transactionBarcode": "12345678901235467890",
    "totalItemCount": 6,
    "instantSavings": 17,
    "subTotal": 91.87,
    "taxes": 8.32,
    "total": 100.19,
    "registerNumber": 123,
    "transactionNumber": 456,
    "operatorNumber": 789,
    "itemArray": [...],
    "couponArray": [...],
    "subTaxes": {...},
    "tenderArray": [...]
  },
  {
    "documentType": "WarehouseReceiptDetail",
    "receiptType": "In-Warehouse",
    "transactionType": "Sales",
    ...
  }
]
```
---
## 🤝 Contributing

Found a bug? Want to add new data fields?
* Fork this repository.
* Create a feature branch (git checkout -b feature/AmazingFeature).
* Commit your changes.
* Open a Pull Request.
