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
   * Version:       1.2.5
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

    /*
    =====================================================
    ⚠️ COSTCO RECEIPT SCHEMA — DO NOT MODIFY CASUALLY ⚠️
    =====================================================
    Rules:
    1. These fields are REQUIRED, NEVER delete/modify:
      - transactionDateTime
      - transactionBarcode
      - membershipNumber
      - warehouseNumber
      - transactionNumber
      - registerNumber
    2. Any field(s) added here MUST 
        a) be added to the CANONICAL SCHEMA (CANONICAL_RECEIPT) below 
        b) RECEIPT_SCHEMA_VERSION Changelog updated
        c) RECEIPT_SCHEMA_VERSION value increased (eg: 1.0.5 -> 1.0.6)
    3. Any field(s) that need to be removed here, MUST NEVER be removed from the CANONICAL SCHEMA (CANONICAL_RECEIPT) below.
    4. Review the CANONICAL SCHEMA RULES below.
    
    NOTE: Breaking these rules will cause data corruption.
    
    =====================================================
      RECEIPT_SCHEMA_VERSION Changelog
    =====================================================
      1.0.0 = Base
      1.0.1 + couponArray{upcnumberCoupon, amountCoupon}
      1.0.2 + couponArray{couponNumber, associatedItemNumber, unitCoupon}
      1.0.3 + couponArray{taxflagCoupon, voidflagCoupon, refundflagCoupon}
      1.0.4 + warehouseAreaCode, warehousePhone
      1.0.5 + itemArray{itemUPCNumber, refundFlag, resaleFlag, voidFlag}
      1.0.6 + invoiceNumber, sequenceNumber, currencyCode, tenderArray{storedValueBucket}
    
      Last reviewed: 2026-01
    =====================================================
    */
    const RECEIPT_SCHEMA_VERSION = "1.0.6";

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
          warehouseAreaCode
          warehousePhone
          companyNumber
          invoiceNumber
          sequenceNumber
          transactionBarcode
          totalItemCount
          instantSavings
          subTotal
          taxes
          total
          currencyCode
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
            resaleFlag
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
            storedValueBucket
            tenderAcctTxnNumber
            tenderAuthorizationCode
            tenderEntryMethodDescription
            walletType
            walletId
          }
        }
      }
  `;
    /*
      ==========================================================
      ⚠️ END - COSTCO RECEIPT SCHEMA — DO NOT MODIFY CASUALLY ⚠️
      ==========================================================
    */

    function validateReceiptQuerySchema() {
      const requiredFields = [
        'transactionBarcode',
        'membershipNumber',
        'transactionDateTime'
      ];

      const reconstructionFields = [
        'warehouseNumber',
        'registerNumber',
        'transactionNumber'
      ];

      const missingRequired = requiredFields.filter(
        field => !LIST_RECEIPTS_QUERY.includes(field)
      );

      if (missingRequired.length > 0) {
        console.error('🛑 INVALID GRAPHQL QUERY — Missing required receipt fields');
        console.error('The following required fields are not requested from Costco:');
        missingRequired.forEach(f => console.error(`  • ${f}`));
        throw new Error(
          'Cannot proceed: GraphQL query does not request required receipt identity fields.'
        );
      }

      const missingReconstruction = reconstructionFields.filter(
        field => !LIST_RECEIPTS_QUERY.includes(field)
      );

      if (missingReconstruction.length > 0) {
        console.warn(
          '⚠️ GraphQL Query Warning: Barcode reconstruction would be impossible if needed.'
        );
        missingReconstruction.forEach(f =>
          console.warn(`  • Missing optional field: ${f}`)
        );
      }

      console.log('✅ GraphQL receipt query validated: required identity fields present.');
    }

    // --- HELPER FOR BEUATIFYING NESTED ERRORS ---
    function cleanNestedError(input) {
      let current = input;
      while (typeof current === 'string') {
        try {
          current = JSON.parse(current);
        } catch (e) {
          break;
        }
      }
      if (Array.isArray(current)) {
        return current.map(item => `  • ${item.trim()}`).join('\n');
      }
      return current;
    }

    // --- Global error formatter
    async function handleApiError(response, contextName) {
      const errorBody = await response.json().catch(() => ({}));
      const rawDescription = errorBody?.context?.statusMessage?.description?.value;
      const unpacked = cleanNestedError(rawDescription);
      const finalMessage = unpacked?.errorMessage ? cleanNestedError(unpacked.errorMessage) : (unpacked || errorBody);

      console.group(`%c 🛑 ${contextName} Failed `, 'color: white; background: #d9534f; font-weight: bold; padding: 2px;');
      console.log(`%cStatus: ${response.status} ${response.statusText}`, 'font-weight: bold;');
      console.log(typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage, null, 2));
      console.groupEnd();
    }


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
          // Use the new centralized helper
          await handleApiError(response, 'Receipt List Fetch');
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
        container.id = "tcrd-ui-container";
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

    /* 
      ===================================
      ===== CANONICAL MERGE HELPERS =====
      ===================================
    */
    function preferNonNull(a, b) {
      if (a === undefined || a === null) return b;
      return a;
    }

    function mergeScalars(a, b) {
      return preferNonNull(a, b);
    }

    function mergeObjects(a = {}, b = {}) {
      const out = {
        ...a
      };
      for (const key of Object.keys(b)) {
        if (typeof b[key] === 'object' && b[key] !== null && !Array.isArray(b[key])) {
          out[key] = mergeObjects(a[key], b[key]);
        } else if (Array.isArray(b[key])) {
          out[key] = mergeArrays(a[key], b[key]);
        } else {
          out[key] = mergeScalars(a[key], b[key]);
        }
      }
      return out;
    }

    function mergeArrays(a = [], b = []) {
      return (b && b.length) ? b : a;
    }

    function mergeReceipt(existing, incoming) {
      // incoming is always considered newer/richer
      return mergeObjects(existing, incoming);
    }
    /* 
      ======================================= 
      ===== END CANONICAL MERGE HELPERS ===== 
      ======================================= 
    */


    /* 
      =====================================
      ===== CANONICAL SCHEMA HELPERS ======
      ===================================== 

      ==================================
       ⚠️  CANONICAL SCHEMA RULES  ⚠️ 
      ==================================
      Rules:

      1. Fields added to the Receipt Schema (LIST_RECEIPTS_QUERY) from above MUST 
          a) be added to the CANONICAL SCHEMA (CANONICAL_RECEIPT) below
          b) CANONICAL_SCHEMA_VERSION Changelog updated
          c) CANONICAL_SCHEMA_VERSION value increased (eg: 1.0.5 -> 1.0.6)
      2. NEVER remove or rename fields. 
          - Add only. 
          - If a field is no longer needed, used or populated, append a comment indicating that is is deprecated.
            Example:
              currencyCode: null, // DEPRECATED YYYY-MM-DD — Retained for backward compatibility

      Breaking these rules will cause data corruption.
      
      ===========================================
      CANONICAL_SCHEMA_VERSION Changelog
      ===========================================
      1.0.0 + Base
      1.0.1 + CANONICAL_COUPON: upcnumberCoupon, amountCoupon
      1.0.2 + CANONICAL_COUPON: couponNumber, associatedItemNumber, unitCoupon
      1.0.3 + CANONICAL_COUPON: taxflagCoupon, voidflagCoupon, refundflagCoupon
      1.0.4 + CANONICAL_RECEIPT: warehouseAreaCode, warehousePhone
      1.0.5 + CANONICAL_ITEM: itemUPCNumber, refundFlag, resaleFlag, voidFlag
      1.0.6 + CANONICAL_RECEIPT: invoiceNumber, sequenceNumber, currencyCode
            + CANONICAL_TENDER:  storedValueBucket

      Last reviewed: 2026-01
      ===========================================
    */
    const CANONICAL_SCHEMA_VERSION = "1.0.6";

    const CANONICAL_RECEIPT = () => ({
      __schemaVersion: CANONICAL_SCHEMA_VERSION,
      documentType: null,
      receiptType: null,
      membershipNumber: null,      // REQUIRED: for multi-member account partitioning
      transactionType: null,
      transactionDateTime: null,   // REQUIRED: for sorting and support diagnostics
      transactionDate: null,
      warehouseShortName: null,
      warehouseNumber: null,       // REQUIRED: support diagnostics / barcode
      warehouseName: null,
      warehouseAddress1: null,
      warehouseAddress2: null,
      warehouseCity: null,
      warehouseState: null,
      warehouseCountry: null,
      warehousePostalCode: null,
      warehouseAreaCode: null,
      warehousePhone: null,
      companyNumber: null,
      invoiceNumber: null,
      sequenceNumber: null,
      transactionBarcode: null,   // REQUIRED: Sole receipt identity key
      totalItemCount: null,
      instantSavings: null,
      subTotal: null,
      taxes: null,
      total: null,
      currencyCode: null,
      registerNumber: null,       // REQUIRED: support diagnostics / barcode
      transactionNumber: null,    // REQUIRED: support diagnostics / barcode
      operatorNumber: null,
      itemArray: [],
      couponArray: [],
      subTaxes: CANONICAL_SUBTAXES(),
      tenderArray: []
    });

    const CANONICAL_ITEM = () => ({
      itemNumber: null,
      itemUPCNumber: null,
      itemDescription01: null,
      itemDescription02: null,
      frenchItemDescription1: null,
      frenchItemDescription2: null,
      itemIdentifier: null,
      itemDepartmentNumber: null,
      transDepartmentNumber: null,
      itemUnitPriceAmount: null,
      unit: null,
      amount: null,
      taxFlag: null,
      refundFlag: null,
      resaleFlag: null,
      voidFlag: null,
      merchantID: null,
      entryMethod: null,
      fuelUnitQuantity: null,
      fuelUomCode: null,
      fuelUomDescription: null,
      fuelUomDescriptionFr: null,
      fuelGradeCode: null,
      fuelGradeDescription: null,
      fuelGradeDescriptionFr: null
    });

    const CANONICAL_COUPON = () => ({
      couponNumber: null,
      upcnumberCoupon: null,
      associatedItemNumber: null,
      unitCoupon: null,
      amountCoupon: null,
      taxflagCoupon: null,
      voidflagCoupon: null,
      refundflagCoupon: null
    });

    const CANONICAL_SUBTAXES = () => ({
      tax1: null,
      tax2: null,
      tax3: null,
      tax4: null,
      aTaxPercent: null,
      aTaxLegend: null,
      aTaxAmount: null,
      aTaxPrintCode: null,
      aTaxPrintCodeFR: null,
      aTaxIdentifierCode: null,
      bTaxPercent: null,
      bTaxLegend: null,
      bTaxAmount: null,
      bTaxPrintCode: null,
      bTaxPrintCodeFR: null,
      bTaxIdentifierCode: null,
      cTaxPercent: null,
      cTaxLegend: null,
      cTaxAmount: null,
      cTaxIdentifierCode: null,
      dTaxPercent: null,
      dTaxLegend: null,
      dTaxAmount: null,
      dTaxPrintCode: null,
      dTaxPrintCodeFR: null,
      dTaxIdentifierCode: null,
      uTaxLegend: null,
      uTaxAmount: null,
      uTaxableAmount: null
    });

    const CANONICAL_TENDER = () => ({
      tenderTypeCode: null,
      tenderSubTypeCode: null,
      tenderTypeName: null,
      tenderTypeNameFr: null,
      tenderDescription: null,
      amountTender: null,
      displayAccountNumber: null,
      sequenceNumber: null,
      approvalNumber: null,
      responseCode: null,
      transactionID: null,
      merchantID: null,
      entryMethod: null,
      storedValueBucket: null,
      tenderAcctTxnNumber: null,
      tenderAuthorizationCode: null,
      tenderEntryMethodDescription: null,
      walletType: null,
      walletId: null
    });
    /* =========================================== */


    function normalizeReceipt(r) {
      /* 
        ================================================================================ 
        IMPORTANT:
          Canonical normalization MUST occur *after* deduplication and merge.
          Normalization is a storage contract, not an identity or comparison mechanism.
          Do NOT call normalizeReceipt() before deduplication logic.
        ================================================================================ 
      */
      const out = {
        ...CANONICAL_RECEIPT(),
        ...r
      };

      out.itemArray = Array.isArray(r.itemArray) ?
        r.itemArray.map(i => ({
          ...CANONICAL_ITEM(),
          ...i
        })) :
        [];

      out.couponArray = Array.isArray(r.couponArray) ?
        r.couponArray.map(c => ({
          ...CANONICAL_COUPON(),
          ...c
        })) :
        [];

      out.subTaxes = r.subTaxes ?
        {
          ...CANONICAL_SUBTAXES(),
          ...r.subTaxes
        } :
        CANONICAL_SUBTAXES();

      out.tenderArray = Array.isArray(r.tenderArray) ?
        r.tenderArray.map(t => ({
          ...CANONICAL_TENDER(),
          ...t
        })) :
        [];

      return out;
    }
    /* 
      =========================================== 
      ====== END CANONICAL SCHEMA HELPERS =======
      =========================================== 
    */

    // Main function - Calculate the date range, fetch, and download receipts
    async function downloadReceipts() {
      console.clear();
      console.log('--- 🛒 Costco Receipts Downloader Started ---');

      // Preflight validation
      validateReceiptQuerySchema();

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

        // 5. — Canonical Merge + Deduplicate
        const receiptMap = new Map();
        let duplicatesRemoved = 0;

        for (const receipt of mergedReceipts) {
          const memberId = receipt.membershipNumber || 'UNKNOWN_MEMBER';

          if (!receipt.transactionBarcode) {
            const isFromAPI = newReceipts.includes(receipt);
            const source = isFromAPI ? 'API (Costco)' : 'Existing Receipt File';
            console.group('🛑 INVALID RECEIPT — Missing transactionBarcode');
            console.error(`Source          : ${source}`);
            console.error(`Membership      : ${receipt.membershipNumber || 'UNKNOWN'}`);
            console.error(`TransactionDate : ${receipt.transactionDateTime || 'UNKNOWN'}`);
            console.error(`Warehouse       : ${receipt.warehouseNumber || 'UNKNOWN'}`);
            console.error(`Register        : ${receipt.registerNumber || 'UNKNOWN'}`);
            console.error(`Transaction No  : ${receipt.transactionNumber || 'UNKNOWN'}`);
            console.error('Full receipt payload follows:');
            console.error(receipt);
            console.groupEnd();

            throw new Error(
              'Hard failure: One or more receipts are missing transactionBarcode. ' +
              'Fix input data or GraphQL query and re-run.'
            );
          }

          const uniqueKey = `${memberId}-${receipt.transactionBarcode}`;

          if (!receiptMap.has(uniqueKey)) {
            receiptMap.set(uniqueKey, receipt);
            if (newReceipts.includes(receipt) && memberId !== 'UNKNOWN_MEMBER') {
              updateStats(memberId, 'unique');
            }
          } else {
            const existing = receiptMap.get(uniqueKey);
            const merged = mergeReceipt(existing, receipt);
            receiptMap.set(uniqueKey, merged);
            duplicatesRemoved++;
          }
        }

        let dedupedReceipts = Array.from(receiptMap.values());
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

        // Canonical normalize receipts
        dedupedReceipts = dedupedReceipts.map(r => normalizeReceipt(r));

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
            console.log(`%c ✅ Successfully saved via FileSystem API: ${handle.name}`, 'color: #5cb85c; font-weight: bold;');
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

            // --- BEGIN IMPROVED FALLBACK DOWNLOAD ---
            const a = document.createElement('a');
            const url = window.URL.createObjectURL(blob); // Define URL as a variable for easier revocation
            a.download = filename;
            a.href = url;
            document.body.appendChild(a);
            a.click();

            // 1. Immediate Success Log
            console.log(`%c ✅ Successfully triggered fallback download: ${filename}`, 'color: #5cb85c; font-weight: bold;');

            // 2. Scheduled Cleanup
            setTimeout(() => {
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url); // Clear RAM
              console.debug(`%c 🧹 Memory Freed: Fallback ObjectURL for ${filename} revoked.`, 'color: #888; font-style: italic;');
            }, 100);

            logStyle(`\n--- 💾 Download Complete! Check your Downloads folder for %c${filename}%c ---`, 'bold', 'normal');
            // --- END IMPROVED FALLBACK DOWNLOAD ---

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
        const ui = document.getElementById("tcrd-ui-container");
        if (ui) ui.remove();
      }
    }

    // Execute the main function
    await downloadReceipts();
  })();
