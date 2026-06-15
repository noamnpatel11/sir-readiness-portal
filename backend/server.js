const express = require('express');
const cors = require('cors');
const stringSimilarity = require('string-similarity');
const { voterList2002, voterList2025 } = require('./mockDatabase');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Your Health Check Route
app.get('/', (req, res) => {
  res.send('SIR Readiness Portal Backend is running successfully!');
});

// --- CATEGORY ELIGIBILITY ENGINE ---
app.get('/api/eligibility', (req, res) => {
  const dobParam = req.query.dob;
  
  if (!dobParam) {
    return res.status(400).json({ error: "Date of birth is required" });
  }

  // Parse the input Date of Birth
  const dob = new Date(dobParam);
  
  // Define Government Cut-off Dates
  const date1987 = new Date('1987-07-01');
  const date2004 = new Date('2004-12-02');

  let responseData = {
    category: "",
    message: "",
    missingDocs: []
  };

  // Implement Official SIR Rules
  if (dob < date1987) {
    responseData.category = "Born before 01.07.1987";
    responseData.message = "Pursuant to official SIR guidelines, you are required to establish your date of birth and/or place of birth.";
    responseData.missingDocs = [
      "Any valid document for Self (establishing DOB/Place of Birth)"
    ];
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

// --- THE MAIN ANALYSIS ENGINE ---
app.post('/analyze', (req, res) => {
  const { documentGrid } = req.body;
  
  if (!documentGrid) {
    return res.status(400).json({ message: "Error: No data received.", errors: [] });
  }

  // Find the Master Document (the first row with a Given Name)
  const masterDoc = documentGrid.find(doc => doc.givenName && doc.givenName.trim() !== "");

  if (!masterDoc) {
    return res.json({ message: "Error: Please fill in at least one Given Name to start the analysis.", errors: [] });
  }

  let discrepancies = [];
  let errorCells = []; 

  // 1. CROSS-CHECK ALL COLUMNS (Except 'Date Issued')
  const fieldsToVerify = ['givenName', 'fatherName', 'motherName', 'spouseName', 'familyName', 'dob', 'place'];

  documentGrid.forEach((doc, rowIndex) => {
    fieldsToVerify.forEach(field => {
      // If both the Master Document and the Current Document have data in this column...
      if (masterDoc[field] && doc[field]) {
        const masterVal = masterDoc[field].trim().toLowerCase();
        const currentVal = doc[field].trim().toLowerCase();
        
        // If they don't match exactly, highlight the cell in red
        if (masterVal !== currentVal) {
          discrepancies.push(`${doc.docType} (${field})`);
          errorCells.push({ rowIndex: rowIndex, field: field });
        }
      }
    });
  });

  // 2. CHECK THE MOCK DATABASE (2002 & 2025)
  const checkDatabase = (databaseList, targetName) => {
    let isVerified = false;
    databaseList.forEach(record => {
      const score = stringSimilarity.compareTwoStrings(record.givenName.toLowerCase(), targetName.toLowerCase());
      if (score >= 0.8) { 
        isVerified = true; 
      }
    });
    return isVerified;
  };

  const foundIn2002 = checkDatabase(voterList2002, masterDoc.givenName);
  const foundIn2025 = checkDatabase(voterList2025, masterDoc.givenName);

  // 3. BUILD THE FINAL STATUS MESSAGE
  let finalMessage = "";
  if (errorCells.length === 0) {
    finalMessage = `Success! All documents match perfectly. `;
  } else {
    // Remove duplicates from the warning message for a cleaner UI reading
    const uniqueDiscrepancies = [...new Set(discrepancies)];
    finalMessage = `WARNING - Mismatches found in: ${uniqueDiscrepancies.join(", ")}. `;
  }

  // Add the database status to the end of the message
  finalMessage += `| DB Status -> 2002 Voter List: [${foundIn2002 ? "VERIFIED" : "NOT FOUND"}] | 2025 Voter List: [${foundIn2025 ? "VERIFIED" : "NOT FOUND"}]`;

  res.json({ message: finalMessage, errors: errorCells });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});