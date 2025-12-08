/**
 * ==============================================================================
 * Project:       TechStud's Costco Receipt Downloader (TCRD)
 * Description:   Automates the retrieval of Costco In-Warehouse receipts for the logged-in member.
 * Features:      
 *                - Historical data fetching (up to 3 years).
 *                - Incremental Merging: Combine new receipts with existing JSON files from previous runs.
 *                - Multi-Member Support: Merge family member receipts into a single master file.
 *                - Enhanced console logging for real-time status.
 *                - Data-Rich Output: Detailed transaction data saved in JSON format.
 * 
 * Version:       1.2.0
 * Author:        TechStud
 * Repository:    https://github.com/TechStud/TCRD
 * License:       MIT
 *
 * Usage:
 *   1. Log in to your regional Costco website (eg: costco.ca, costco.com, costco.co.uk, ...).
 *   2. Navigate to 'Orders & Returns' -> 'In-Warehouse'.
 *   3. Open Developer Tools (F12 or Cmd/Ctrl + Shift + I) and go to the 'Console' tab.
 *   4. Paste in this entire script and press Enter.
 *   5. Click one of the two on-screen buttons (lower-right corner of the webpage):
 *      ↳ If this is your first run, click the 'Start Fresh (No File)' button.
 *      ↳ If you're re-running this script, click the 'Load Existing Receipt File' button.
 *
 * Disclaimer:
 *   This script is for educational and personal archiving purposes only.
 *   The author and this script are not affiliated with, endorsed by, or supported by 
 *   Costco Wholesale Corporation. Use this script at your own risk. 
 *   The author is not responsible for any member/account limitations or data discrepancies.
 *
 * SENSITIVE DATA WARNING:
 *   Downloaded content contains sensitive purchase and partial payment data.
 *   Treat all data/file content accordingly and keep it secure.
 * ==============================================================================
 */

(async function() {

  const boldStyle = 'font-weight: bold;';

  function logStyle(msg, ...styles) {
    const cssStyles = styles.map(s => {
      if (s === 'bold') return boldStyle;
      return '';
    });
    console.log(msg, ...cssStyles);
  }

  const LIST_RECEIPTS_QUERY = `
    query receipts($startDate: String!, $endDate: String!) {
      receipts(startDate: $startDate, endDate: $endDate) {
        documentType
        receiptType
        membershipNumber
        transactionType
        transactionDateTime
        transactionDate
        warehouseShortName
        warehouseNumber
        warehouseName
        warehouseAddress1
        warehouseAddress2
        warehouseCity
        warehouseState
        warehouseCountry
        warehousePostalCode
        companyNumber
        transactionBarcode
        totalItemCount
        instantSavings
        subTotal
        taxes
        total
        registerNumber
        transactionNumber
        operatorNumber
        itemArray {
          itemNumber
          itemUPCNumber
          itemDescription01
          itemDescription02
          frenchItemDescription1
          frenchItemDescription2
          itemIdentifier
          itemDepartmentNumber
          transDepartmentNumber
          itemUnitPriceAmount
          unit
          amount
          taxFlag
          refundFlag
          voidFlag
          merchantID
          entryMethod
          fuelUnitQuantity
          fuelUomCode
          fuelUomDescription
          fuelUomDescriptionFr
          fuelGradeCode
          fuelGradeDescription
          fuelGradeDescriptionFr
        }
        couponArray {
          couponNumber
          upcnumberCoupon
          associatedItemNumber
          unitCoupon
          amountCoupon
          taxflagCoupon
          voidflagCoupon
          refundflagCoupon
        }
        subTaxes {
          tax1
          tax2
          tax3
          tax4
          aTaxPercent
          aTaxLegend
          aTaxAmount
          aTaxPrintCode
          aTaxPrintCodeFR
          aTaxIdentifierCode
          bTaxPercent
          bTaxLegend
          bTaxAmount
          bTaxPrintCode
          bTaxPrintCodeFR
          bTaxIdentifierCode
          cTaxPercent
          cTaxLegend
          cTaxAmount
          cTaxIdentifierCode
          dTaxPercent
          dTaxLegend
          dTaxAmount
          dTaxPrintCode
          dTaxPrintCodeFR
          dTaxIdentifierCode
          uTaxLegend
          uTaxAmount
          uTaxableAmount
        }
        tenderArray {
          tenderTypeCode
          tenderSubTypeCode
          tenderTypeName
          tenderTypeNameFr
          tenderDescription
          amountTender
          displayAccountNumber
          sequenceNumber
          approvalNumber
          responseCode
          transactionID
          merchantID
          entryMethod
          tenderAcctTxnNumber
          tenderAuthorizationCode
          tenderEntryMethodDescription
          walletType
          walletId
        }
      }
    }
  `;

  // Validate the existence of required authentication tokens 
  function validateTokens() {
    const clientID = localStorage.getItem('clientID');
    const idToken = localStorage.getItem('idToken');

    if (!clientID || !idToken) {
      console.error('--- 🛑 AUTHORIZATION ERROR 🛑 ---');
      console.error('The necessary authorization tokens (clientID or idToken) were not found in localStorage.');
      console.error('Please ensure you are currently logged in to your Costco account and are on the Orders & Purchases page.');
      console.error('The script cannot proceed without these security tokens.');
      throw new Error('Missing authentication tokens.');
    }
    return {
      clientID,
      idToken
    };
  }


  // GraphQL API call to fetch receipts for a given date range 
  async function listReceipts(startDate, endDate) {
    const {
      clientID,
      idToken
    } = validateTokens();

    const listReceiptsQuery = {
      query: LIST_RECEIPTS_QUERY.replace(/\s+/g, ' '),
      variables: {
        startDate,
        endDate
      },
    };

    try {
      console.log(`📡 Requesting receipts from ${startDate} to ${endDate}...`);

      const response = await fetch(
        'https://ecom-api.costco.com/ebusiness/order/v1/orders/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Costco.Env': 'ecom',
            'Costco.Service': 'restOrders',
            'Costco-X-Wcs-Clientid': clientID,
            'Client-Identifier': '481b1aec-aa3b-454b-b81b-48187e28f205',
            'Costco-X-Authorization': 'Bearer ' + idToken,
          },
          body: JSON.stringify(listReceiptsQuery),
        }
      );

      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('❌ GraphQL Errors:', result.errors);
        console.error('Full API Response:', result);
        throw new Error('GraphQL query execution failed.');
      }

      const receipts = result?.data?.receipts;
      if (!Array.isArray(receipts)) {
        console.error('❌ API response data structure is unexpected.', result);
        throw new Error('API response did not contain the expected receipt array.');
      }

      return receipts;
    } catch (error) {
      console.error('🛑 An error occurred during the receipt API call:', error.message);
      throw error;
    }
  }


  // Prompt the user to get started or to load their existing JSON file
  async function getExistingReceipts() {
    return new Promise((resolve) => {
      let resolved = false;
      // Create a container to hold both buttons
      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999",
        display: "flex",
        gap: "10px" // Space between buttons
      });

      // 1. Create the "Load Existing" button
      const loadBtn = document.createElement("button");
      loadBtn.textContent = "Load Existing Receipt File";
      Object.assign(loadBtn.style, {
        padding: "10px 20px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
      });

      // 2. Create the "Start Fresh" button
      const freshBtn = document.createElement("button");
      freshBtn.textContent = "Start Fresh (No File)";
      Object.assign(freshBtn.style, {
        padding: "10px 20px",
        backgroundColor: "#6c757d", // Grey color to indicate secondary action
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
      });

      // Logic for "Start Fresh"
      freshBtn.addEventListener("click", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        container.remove();
        console.log("User selected to start fresh.");
        resolve([]);
      });

      // Logic for "Load Existing"
      loadBtn.addEventListener("click", () => {
        if (resolved) return;
        // Create hidden file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
          if (resolved) return;
          const file = e.target.files[0];
          if (!file) return;

          resolved = true;
          clearTimeout(timeoutId);
          container.remove();

          const reader = new FileReader();
          reader.onload = (event) => {
            console.log("🗎 User selected to start with an existing file of Costco Receipts.");
            console.log(`    ↳ File: ${file.name}`)
            try {
              const data = JSON.parse(event.target.result);
              console.log(`    ↳ Loaded ${data.length} existing receipts.`);
              resolve(data);
            } catch (err) {
              console.error("    ↳ Error parsing JSON file", err);
              resolve([]); // Fallback to empty on error
            }
          };
          reader.readAsText(file);
        };

        input.click();
      });

      // Append buttons to container, and container to body
      container.appendChild(loadBtn);
      container.appendChild(freshBtn);
      document.body.appendChild(container);

      // Timer: Reduced to 30 seconds
      const timeoutId = setTimeout(() => {
        if (document.body.contains(container)) {
          console.log("No interaction within 30 seconds. Proceeding automatically.");
          container.remove();
          if (!resolved) {
            resolved = true;
            resolve([]);
          }
        }
      }, 30000);
    });
  }

  // Main function - Calculate the date range, fetch, and download receipts
  async function downloadReceipts() {
    console.clear();
    console.log('--- 🛒 Costco Receipts Downloader Started ---');

    // Stats tracking map
    const statsMap = new Map();
    const updateStats = (memberId, type, count = 1) => {
      const stats = statsMap.get(memberId) || {
        existing: 0,
        new: 0,
        unique: 0
      };
      stats[type] += count;
      statsMap.set(memberId, stats);
    };

    try {
      // 0. Token Validation
      validateTokens();
      console.log('✅ Authentication tokens found. Proceeding with receipt download.');

      // 1. Get Existing Data
      const existingReceipts = await getExistingReceipts();
      console.log(`ℹ️ Resuming script with ${existingReceipts.length} existing receipts.`);

      // Pre-process existing receipts for initial stats
      existingReceipts.forEach(r => {
        if (r.membershipNumber) {
          updateStats(r.membershipNumber, 'existing');
        }
      });

      // 2. Calculate Date Range (Costco max 3 years)
      const now = new Date();
      const startDateObj = new Date(now);

      startDateObj.setFullYear(now.getFullYear() - 3);
      startDateObj.setMonth(startDateObj.getMonth() - 1);
      startDateObj.setDate(1);

      const startDateStr = startDateObj.toISOString().slice(0, 10);
      const endDateStr = now.toISOString().slice(0, 10);

      console.log(`📅 Fetch Range: ${startDateStr} to ${endDateStr} (3 years maximum).`);

      // 3. Fetch New Receipts
      const newReceipts = await listReceipts(startDateStr, endDateStr);

      // Update new receipt stats
      newReceipts.forEach(r => {
        if (r.membershipNumber) {
          updateStats(r.membershipNumber, 'new');
        }
      });

      // 4. Merge Data
      const mergedReceipts = [...existingReceipts, ...newReceipts];
      logStyle('\n🔄 Merging ' + existingReceipts.length + ' Existing Receipts (from file) with + ' + newReceipts.length + ' New Receipts Fetched  (via API) = %c' + mergedReceipts.length + '%c Total Receipts.', 'bold', 'normal');

      // 5. Deduplicate (Using a Map for O(N) deduplication)
      const receiptMap = new Map();
      let duplicatesRemoved = 0;

      for (const receipt of mergedReceipts) {
        const memberId = receipt.membershipNumber || 'UNKNOWN_MEMBER';

        // Unique key: membershipNumber + transactionBarcode
        if (!receipt.transactionBarcode || receipt.transactionBarcode.length < 15) {
          duplicatesRemoved++;
          continue;
        }
        const uniqueKey = `${memberId}-${receipt.transactionBarcode}`;

        if (!receiptMap.has(uniqueKey)) {
          receiptMap.set(uniqueKey, receipt);
          // Only count 'unique' receipts fetched in this run
          if (newReceipts.includes(receipt) && memberId !== 'UNKNOWN_MEMBER') {
            updateStats(memberId, 'unique');
          }
        } else {
          duplicatesRemoved++;
        }
      }

      const dedupedReceipts = Array.from(receiptMap.values());
      console.log(`✂️ ↳ Deduplication Process Complete: Removed ${duplicatesRemoved} duplicate Receipts.`);
      logStyle('✅ ↳ Final unique Receipt count is %c' + dedupedReceipts.length + '%c.', 'bold', 'normal');

      if (dedupedReceipts.length === 0) {
        console.log('ℹ️ No unique receipts found. Exiting download.');
        return;
      }

      // 6. Final Stats Report (Based on the statsMap)
      console.log('\n--- 📊 MERGE AND DOWNLOAD STATISTICS ---');
      let totalExisting = 0;
      let totalNew = 0;
      let totalNewUniqueMerged = 0;
      const totalMembers = statsMap.size;

      statsMap.forEach((stats, memberId) => {
        totalExisting += stats.existing;
        totalNew += stats.new;

        const duplicatesInAPIFetch = stats.new - stats.unique;
        const newUniqueToMerge = stats.unique;
        totalNewUniqueMerged += newUniqueToMerge;

        const finalTotalSaved = stats.existing + newUniqueToMerge;

        console.log('\n-------------------------------------------');
        logStyle(`👤 %cMember ${memberId}:%c`, 'bold', 'normal');
        console.log(`  - Existing Receipts (from file)   :  ${stats.existing}`);
        console.log(`  - Receipts Fetched  (via API)     :  ${stats.new}`);
        console.log(`  - Duplicates Found  (in API Fetch):  ${duplicatesInAPIFetch}`);
        logStyle(`  - New   Unique Receipts to Merge  : %c ${newUniqueToMerge}%c`, 'bold', 'normal');
        logStyle(`  - Total Unique Receipts Saved     : %c ${finalTotalSaved}%c`, 'bold', 'normal');
      });

      console.log('\n-------------------------------------------');
      logStyle('🧾 %cTOTALS%c', 'bold', 'normal');
      console.log(`  - Costco Members                  :  ${totalMembers}`);
      console.log(`  - Existing Receipts (from file)   :  ${totalExisting}`);
      console.log(`  - Receipts Fetched (from API)     :  ${totalNew}`);
      logStyle(`  - New Receipts Merged             :  %c${totalNewUniqueMerged}%c`, 'bold', 'normal');
      logStyle(`  - Unique Receipts Saved           :  %c${dedupedReceipts.length}%c`, 'bold', 'normal');
      console.log('\n-------------------------------------------');


      // 7. Sort by transaction date/time (Oldest -> Newest)
      dedupedReceipts.sort((a, b) => new Date(a.transactionDateTime) - new Date(b.transactionDateTime));
      console.log('✅ Receipts have been sorted Oldest -> Newest');

      // 8. Trigger Download
      const uniqueMemberIds = [...new Set(dedupedReceipts.map(r => r.membershipNumber).filter(Boolean))];

      let filename = 'Costco_In-Warehouse_Receipts.json'; // Default
      if (uniqueMemberIds.length === 1) {
        filename = `Costco_In-Warehouse_Receipts_${uniqueMemberIds[0]}.json`;
      } else if (uniqueMemberIds.length > 1) {
        filename = `Costco_In-Warehouse_Receipts_${uniqueMemberIds.length}-Members.json`;
      }

      const dataStr = JSON.stringify(dedupedReceipts, null, 2);
      const blob = new Blob([dataStr], {
        type: 'application/json'
      });

      try {
        // Attempt 1: Modern "Save As" Picker (allows overwriting)
        if ('showSaveFilePicker' in window) {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'JSON File',
              accept: {
                'application/json': ['.json']
              },
            }],
          });

          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          logStyle(`\n--- 💾 Saved successfully to: ${handle.name} ---`, 'bold', 'normal');

        } else {
          throw new Error("File System Access API not supported.");
        }
      } catch (err) {
        // Fallback: Standard Download (if user cancels or browser unsupported)
        if (err.name !== 'AbortError') { // Don't log error if user clicked 'Cancel' on the dialog
          console.log("ℹ️ Unable to call the Save File dialog interface... falling back to browser download defaults.");
          console.log("💡 ↳ TIP: All browsers have an option to open the Save File dialog interface when downloading files...");
          console.log("💡        ↳ In your browser go to: Settings -> Downloads -> Enable the related 'Ask where to save each file before downloading' option.");
          const a = document.createElement('a');
          a.download = filename;
          a.href = window.URL.createObjectURL(blob);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(a.href);
          logStyle(`\n--- 💾 Download Complete! Check your Downloads folder for %c${filename}%c ---`, 'bold', 'normal');
        } else {
          console.log("❌ User cancelled the save dialog.");
        }
      }
    } catch (error) {
      // Catch error thrown from validateTokens (e.g., token validation failed)
      if (error.message !== 'Missing authentication tokens.') {
        console.error('🛑 The receipt download process could not be completed.', error);
      }
    } finally {
      console.log('--- 🏁 Costco Receipts Downloader Finished ---');
      // Ensure the temporary button is removed after completion
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.textContent.includes("Load Existing") || btn.textContent.includes("Start Fresh")) {
          if (btn.parentElement && btn.parentElement.tagName === 'DIV') {
            btn.parentElement.remove();
          }
        }
      });
    }
  }

  // Execute the main function
  await downloadReceipts();
})();
