# TechStud's Costco Receipt Downloader (TCRD)

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**TCRD** is a client-side JavaScript tool that simplifies the process of retrieving and archiving your Costco in-warehouse receipts. 

It runs directly in your web browser to fetch up to **3 years** of data-rich receipt history, exporting it in JSON format, and intelligently merges any new receipt data with your existing archives (_if you select an existing Costco Receipt file_) to prevent duplicates.

---

## 🌟 Features
   * **📅 Historical Data:** Fetches the maximum allowed history (rolling 3 years) from your Costco account.
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
- Go to your regional Costco website (e.g., [Costco.ca](https://www.costco.ca), [Costco.com](https://www.costco.com), [Costco.co.uk](https://www.costco.co.uk), ...) and log in to your account.

**2. Navigate to Orders & Returns -> In-Warehouse**
- Click on **Orders & Returns** in the top menu, then select the tab labeled **In-Warehouse**.
   - *Note: You must be on this specific page for the script to work.*

**3. Open the Developer Console**
- This is the "Matrix" view of your browser. Don't worry, it's safe!
   * **Windows/Linux:** Press `F12` or `Ctrl` + `Shift` + `I`
   * **Mac:** Press `Cmd` + `Option` + `I`
- Then, click on the tab at the top labeled **"Console"**.

**4. Run the Script**
- Copy the entire code from **[costco_receipt_downloader.js](costco_receipt_downloader.js)** in this repository. Paste it into the Console area and press **Enter**.

**5. Choose Your Action**
- Look at the bottom-right corner of the Costco webpage. You will see two new buttons:

   * `Option A`: **Start Fresh (No File)**
       * Click this if it is your **first time** running the tool.
       * It will fetch all available history (up to 3 years) and save a new file.
   
   * `Option B`: **Load Existing Receipt File**
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
* We try to active the **_Save As_** window, allowing you chose where to save the file, (or to overwrite your old existing file if you choose). If it doesn't activate, the file will automatically download to your default downloads folder.
* 💡 **TIP:** All major browsers offer a setting to _Ask where to save each file before downloading_ allowing you to choose the destination for every download instead of it automatically going to a default downloads folder.
    - **`Google Chrome`:** Settings > Downloads > Toggle **_Ask where to save each file before downloading_**.
    - **`Microsoft Edge`:** Settings > Downloads > Toggle **_Ask me what to do with each download_** or find the _Location_ section to change settings.
    - **`Mozilla Firefox`:** Settings (General tab) > Downloads > **_Select Always ask you where to save files_**.
    - **`Safari (Mac)`:** Safari > Settings > General > File download location > Select **_Ask for each download_** or choose a specific folder. 

---
## 📸 Screenshots

  <img width="1919" height="1091" alt="image" src="https://github.com/user-attachments/assets/9be462f4-48bd-41bc-9988-ae91ce40f81b" />
  
  1. Click '**Orders & Returns**' and then click '**Warehouse**'
  2. Open **Developer Tools** (F12 or Cmd/Ctrl + Shift + I) and click the '**Console**' tab

---
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/e84c2c66-a473-40a4-8167-23285acbf452" />
  
  3. Paste in the entire TCRD script into the Browser Console and press Enter (or press Run)
  4. Click one of the two on-screen buttons (_lower-right corner of the webpage_):

     * ↳ If this is your first run, click the **`Start Fresh (No File)`** button.
     * ↳ If you're re-running this script, click the **`Load Existing Receipt File`** button.
       - ↳ From here you can select your existing Costco Receipt file (eg: **_`Costco_In-Warehouse_Receipts_123456789.json`_**)

---
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/d85ecb59-5703-42fb-a557-313078fb86f6" />
   
     * Console logging showing the output after clicking the **`Start Fresh (No File)`** button press

---
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/0427504f-527a-4ffa-b78d-c65a7bcbd251" />
   
   * Console logging showing the output after clicking the **`Load Existing Receipt File`** button and selecting a JSON file with previous receipts.

---
## ⚠️ Privacy & Liability Disclaimer
* **Sensitive Data:** The downloaded JSON file contains your shopping history, partial payment information, and membership numbers. Keep this file secure. Do not share it publicly.
* **Terms of Use:** This script is an unofficial tool for personal archiving. It is not endorsed by Costco Wholesale Corporation.
* **Liability:** The author (TechStud) is not responsible for any data discrepancies, missed receipts, or account limitations imposed by Costco. Use at your own risk.
---


---
## 🤓 For Advanced Users

### The Merging Logic
The script uses a composite key of `MembershipNumber` + `TransactionBarcode` to identify unique receipts.
1.  **Ingest:** Loads the JSON provided by the user.
2.  **Fetch:** Scrapes the API for the last 3 years of data.
3.  **Merge:** Combines arrays.
4.  **Dedupe:** Iterates through the merged list. If a conflict is found, it prioritizes the *existing* local data (assuming you may have manually edited it), though usually, the data is identical.

### JSON Structure
The output is an array of objects. Below is an example of a single **Sales Receipt** (_Refund Receipt is the same_):
```json
[  
  {
    "documentType": "WarehouseReceiptDetail",
    "receiptType": "In-Warehouse",
    "membershipNumber": "123456789012",
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
    "companyNumber": 4,
    "transactionBarcode": "21000100602972310251430",
    "totalItemCount": 10,
    "instantSavings": 21,
    "subTotal": 101.66,
    "taxes": 3.77,
    "total": 105.43,
    "registerNumber": 6,
    "transactionNumber": 297,
    "operatorNumber": 601,
    "itemArray": [
      {
        "itemNumber": "17120",
        "itemUPCNumber": 0,
        "itemDescription01": "GYRO KIT",
        "itemDescription02": "GREEK STYLE",
        "frenchItemDescription1": "PITA GYRO",
        "frenchItemDescription2": "À LA GRECQUE",
        "itemIdentifier": null,
        "itemDepartmentNumber": 63,
        "transDepartmentNumber": 63,
        "itemUnitPriceAmount": 13.49,
        "unit": 1,
        "amount": 21.75,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1715281",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/17120",
        "itemDescription02": null,
        "frenchItemDescription1": "PITA GYRO",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 63,
        "transDepartmentNumber": 63,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -3,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1661969",
        "itemUPCNumber": 0,
        "itemDescription01": "BULGOGI BOWL",
        "itemDescription02": null,
        "frenchItemDescription1": "BOEUF BULGOGI 6X229G P99",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 16.99,
        "unit": 1,
        "amount": 16.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1715228",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/1661969",
        "itemDescription02": null,
        "frenchItemDescription1": "BOEUF BULGOGI 6X229G P99",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -4,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1363537",
        "itemUPCNumber": 0,
        "itemDescription01": "CREPES",
        "itemDescription02": "20 COUNT P400 ECSL45",
        "frenchItemDescription1": "LA BOULANGERE CREPES 640G",
        "frenchItemDescription2": "COMPTE DE 20 P400 ECSL45",
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 11.99,
        "unit": 1,
        "amount": 11.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1716231",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/1363537",
        "itemDescription02": null,
        "frenchItemDescription1": "LA BOULANGERE CREPES 640G",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -3,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1667742",
        "itemUPCNumber": 0,
        "itemDescription01": "RUFFLES KFC",
        "itemDescription02": "525G P126",
        "frenchItemDescription1": "RUFFLES CHIPS SAVEUR PFK",
        "frenchItemDescription2": "525G P126",
        "itemIdentifier": null,
        "itemDepartmentNumber": 12,
        "transDepartmentNumber": 12,
        "itemUnitPriceAmount": 5.99,
        "unit": 1,
        "amount": 5.99,
        "taxFlag": "Y",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1696237",
        "itemUPCNumber": 0,
        "itemDescription01": "RUFFLES REG",
        "itemDescription02": "612 G     P96",
        "frenchItemDescription1": "RUFFLES NATURE",
        "frenchItemDescription2": "612 G     P96",
        "itemIdentifier": null,
        "itemDepartmentNumber": 12,
        "transDepartmentNumber": 12,
        "itemUnitPriceAmount": 5.99,
        "unit": 1,
        "amount": 5.99,
        "taxFlag": "Y",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1448167",
        "itemUPCNumber": 0,
        "itemDescription01": "PUFF PASTRY",
        "itemDescription02": "6T3H 216P   792G",
        "frenchItemDescription1": "BOUCHES FEUILLETTEES",
        "frenchItemDescription2": "6T3H 216P   792G",
        "itemIdentifier": null,
        "itemDepartmentNumber": 18,
        "transDepartmentNumber": 18,
        "itemUnitPriceAmount": 11.99,
        "unit": 1,
        "amount": 11.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1714123",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/1448167",
        "itemDescription02": null,
        "frenchItemDescription1": "BOUCHES FEUILLETTEES",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 18,
        "transDepartmentNumber": 18,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -3,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1076115",
        "itemUPCNumber": 0,
        "itemDescription01": "MINI BELLAS",
        "itemDescription02": "680G / 1.5 LB",
        "frenchItemDescription1": "CHAMPIGNONS MINI BELLA",
        "frenchItemDescription2": "PRODUIT DU CANADA",
        "itemIdentifier": null,
        "itemDepartmentNumber": 65,
        "transDepartmentNumber": 65,
        "itemUnitPriceAmount": 5.99,
        "unit": 1,
        "amount": 5.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "380444",
        "itemUPCNumber": 0,
        "itemDescription01": "SWIFFER DRY",
        "itemDescription02": "T56H3  80207786      P168",
        "frenchItemDescription1": "SWIFFER LINGES JETABLES",
        "frenchItemDescription2": "80 PK                P168",
        "itemIdentifier": null,
        "itemDepartmentNumber": 14,
        "transDepartmentNumber": 14,
        "itemUnitPriceAmount": 21.99,
        "unit": 1,
        "amount": 21.99,
        "taxFlag": "Y",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1713164",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/SWIFFER",
        "itemDescription02": null,
        "frenchItemDescription1": "SWIFFER LINGES JETABLES",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 14,
        "transDepartmentNumber": 14,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -5,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "357576",
        "itemUPCNumber": 0,
        "itemDescription01": "APPLE CIDER",
        "itemDescription02": "ECSL35",
        "frenchItemDescription1": "JUS DE POMME 3L C6",
        "frenchItemDescription2": "ECSL35",
        "itemIdentifier": null,
        "itemDepartmentNumber": 17,
        "transDepartmentNumber": 17,
        "itemUnitPriceAmount": 4.99,
        "unit": 1,
        "amount": 4.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1621817",
        "itemUPCNumber": 0,
        "itemDescription01": "GARDEN SOUP",
        "itemDescription02": "SOUP 6X400ML P220",
        "frenchItemDescription1": "ALLEN SUPER GARDENHARVEST",
        "frenchItemDescription2": "SOUP 6X400ML P220",
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 14.99,
        "unit": 1,
        "amount": 14.99,
        "taxFlag": "N",
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": 10,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      },
      {
        "itemNumber": "1712143",
        "itemUPCNumber": 0,
        "itemDescription01": "TPD/1621817",
        "itemDescription02": null,
        "frenchItemDescription1": "ALLEN SUPER GARDENHARVEST",
        "frenchItemDescription2": null,
        "itemIdentifier": null,
        "itemDepartmentNumber": 13,
        "transDepartmentNumber": 13,
        "itemUnitPriceAmount": 0,
        "unit": -1,
        "amount": -3,
        "taxFlag": null,
        "refundFlag": null,
        "voidFlag": null,
        "merchantID": null,
        "entryMethod": null,
        "fuelUnitQuantity": null,
        "fuelUomCode": null,
        "fuelUomDescription": null,
        "fuelUomDescriptionFr": null,
        "fuelGradeCode": null,
        "fuelGradeDescription": null,
        "fuelGradeDescriptionFr": null
      }
    ],
    "couponArray": [
      {
        "couponNumber": "1715228",
        "upcnumberCoupon": "410099692305",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -4,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      },
      {
        "couponNumber": "1714123",
        "upcnumberCoupon": "410099695061",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -3,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      },
      {
        "couponNumber": "1713164",
        "upcnumberCoupon": "410099699236",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -5,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      },
      {
        "couponNumber": "1716231",
        "upcnumberCoupon": "410099689244",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -3,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      },
      {
        "couponNumber": "1715281",
        "upcnumberCoupon": "410099692114",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -3,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      },
      {
        "couponNumber": "1712143",
        "upcnumberCoupon": "410099702981",
        "associatedItemNumber": "0",
        "unitCoupon": -1,
        "amountCoupon": -3,
        "taxflagCoupon": null,
        "voidflagCoupon": null,
        "refundflagCoupon": null
      }
    ],
    "subTaxes": {
      "tax1": null,
      "tax2": null,
      "tax3": null,
      "tax4": null,
      "aTaxPercent": 13,
      "aTaxLegend": "HST",
      "aTaxAmount": 3.77,
      "aTaxPrintCode": null,
      "aTaxPrintCodeFR": null,
      "aTaxIdentifierCode": null,
      "bTaxPercent": null,
      "bTaxLegend": null,
      "bTaxAmount": null,
      "bTaxPrintCode": null,
      "bTaxPrintCodeFR": null,
      "bTaxIdentifierCode": null,
      "cTaxPercent": null,
      "cTaxLegend": null,
      "cTaxAmount": null,
      "cTaxIdentifierCode": null,
      "dTaxPercent": null,
      "dTaxLegend": null,
      "dTaxAmount": null,
      "dTaxPrintCode": null,
      "dTaxPrintCodeFR": null,
      "dTaxIdentifierCode": null,
      "uTaxLegend": "GST/HST",
      "uTaxAmount": null,
      "uTaxableAmount": null
    },
    "tenderArray": [
      {
        "tenderTypeCode": "062",
        "tenderSubTypeCode": null,
        "tenderTypeName": "Master Card",
        "tenderTypeNameFr": null,
        "tenderDescription": "Master Card",
        "amountTender": 105.43,
        "displayAccountNumber": "1234",
        "sequenceNumber": null,
        "approvalNumber": null,
        "responseCode": null,
        "transactionID": null,
        "merchantID": null,
        "entryMethod": null,
        "tenderAcctTxnNumber": null,
        "tenderAuthorizationCode": null,
        "tenderEntryMethodDescription": null,
        "walletType": null,
        "walletId": null
      }
    ]
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


