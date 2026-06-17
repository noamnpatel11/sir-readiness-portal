const express = require('express');
const cors = require('cors');

// Import your separated database arrays
const { voterList2002, voterList2025 } = require('./mockDatabase');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. HEALTH CHECK ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.send('SIR Readiness Portal Backend is running successfully!');
});

// ==========================================
// 2. CATEGORY ELIGIBILITY ENGINE (DOB CHECK)
// ==========================================
app.get('/api/eligibility', (req, res) => {
  const dobParam = req.query.dob;
  
  if (!dobParam) {
    return res.status(400).json({ error: "Date of birth is required" });
  }

  const dob = new Date(dobParam);
  const date1987 = new Date('1987-07-01');
  const date2004 = new Date('2004-12-02');

  let responseData = { category: "", message: "", missingDocs: [] };

  if (dob < date1987) {
    responseData.category = "Born before 01.07.1987";
    responseData.message = "Pursuant to official SIR guidelines, you are required to establish your date of birth and/or place of birth.";
    responseData.missingDocs = ["Any valid document for Self (establishing DOB/Place of Birth)"];
  } else if (dob >= date1987 && dob <= date2004) {
    responseData.category = "Born between 01.07.1987 and 02.12.2004";
    responseData.message = "Pursuant to official SIR guidelines, you must establish the birth details for yourself and ONE parent.";
    responseData.missingDocs = [
      "Valid document for Self (establishing DOB/Place of Birth)",
      "Valid document for Father OR Mother (establishing DOB/Place of Birth)"
    ];
  } else {
    responseData.category = "Born after 02.12.2004";
    responseData.message = "Pursuant to official SIR guidelines, you must establish the birth details for yourself and BOTH parents.";
    responseData.missingDocs = [
      "Valid document for Self (establishing DOB/Place of Birth)",
      "Valid document for Father (establishing DOB/Place of Birth)",
      "Valid document for Mother (establishing DOB/Place of Birth)"
    ];
  }

  res.json(responseData);
});

// ==========================================
// 3. GRID ANALYSIS ENGINE (FIXED LOGIC)
// ==========================================
app.post('/analyze', (req, res) => {
  // Extract BOTH the document grid and the specific master index from frontend
  const { documentGrid, masterIndex } = req.body;
  
  if (!documentGrid) {
    return res.status(400).json({ message: "Error: No data received.", errors: [] });
  }

  if (masterIndex === undefined || masterIndex === null) {
    return res.status(400).json({ message: "Error: No Master Document selected.", errors: [] });
  }

  // Force the Master Document to be the exact row selected on the frontend
  const masterDoc = documentGrid[masterIndex];

  let discrepancies = [];
  let errorCells = []; 
  const fieldsToVerify = ['givenName', 'fatherName', 'motherName', 'spouseName', 'familyName', 'dob', 'place'];

  // Check rows for typos against the master row
  documentGrid.forEach((doc, rowIndex) => {
    // Skip comparing the master document to itself
    if (rowIndex === masterIndex) return;

    // Skip completely empty rows
    const hasData = Object.values(doc).some(val => val !== "" && val !== doc.docType);
    if (!hasData) return;

    fieldsToVerify.forEach(field => {
      if (masterDoc[field] && doc[field]) {
        const masterVal = masterDoc[field].trim().toLowerCase();
        const currentVal = doc[field].trim().toLowerCase();
        
        if (masterVal !== currentVal) {
          discrepancies.push(`${doc.docType} (${field})`);
          errorCells.push({ rowIndex: rowIndex, field: field });
        }
      }
    });
  });

  let finalMessage = "";
  if (errorCells.length === 0) {
    finalMessage = `Success! All documents match perfectly against ${masterDoc.docType}.`;
  } else {
    const uniqueDiscrepancies = [...new Set(discrepancies)];
    finalMessage = `WARNING - Mismatches found against ${masterDoc.docType} in: ${uniqueDiscrepancies.join(", ")}.`;
  }

  res.json({ message: finalMessage, errors: errorCells });
});

// ==========================================
// 4. DATABASE SEARCH ENGINE (NEW MODAL LOGIC)
// ==========================================
app.post('/api/search-voter', (req, res) => {
  console.log("\n--- NEW SEARCH REQUEST INITIATED ---");
  console.log("1. Raw data received from frontend:", req.body);

  // Catch-all line to find the search term no matter how the frontend labels it
  const rawSearchTerm = req.body.applicantName || req.body.query || req.query.query || req.query.applicantName;
  console.log("2. Server understood the search term as:", rawSearchTerm);

  // If the search is empty or missing, return zero results immediately
  if (!rawSearchTerm) {
    console.log("3. Search term was empty/undefined. Returning 0 results.");
    return res.json({ searchQuery: "", results2002: [], results2025: [], totalFound: 0 });
  }

  // Make the search term lowercase to ignore capitalization
  const searchQuery = rawSearchTerm.toLowerCase().trim();

  // Filter the 2002 list
  const results2002 = voterList2002.filter(voter => {
    const given = (voter.givenName || "").toLowerCase();
    const family = (voter.familyName || "").toLowerCase();
    return given.includes(searchQuery) || family.includes(searchQuery);
  });

  // Filter the 2025 list
  const results2025 = voterList2025.filter(voter => {
    const given = (voter.givenName || "").toLowerCase();
    const family = (voter.familyName || "").toLowerCase();
    return given.includes(searchQuery) || family.includes(searchQuery);
  });

  console.log(`4. Database check complete: Found ${results2002.length} in 2002, and ${results2025.length} in 2025.`);

  // Send the matched results back to the frontend
  res.json({
    searchQuery: rawSearchTerm,
    results2002: results2002,
    results2025: results2025,
    totalFound: results2002.length + results2025.length
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});