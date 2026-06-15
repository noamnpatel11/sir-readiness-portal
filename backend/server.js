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
// 3. GRID ANALYSIS ENGINE (TYPO CHECKER)
// ==========================================
app.post('/analyze', (req, res) => {
  const { documentGrid } = req.body;
  
  if (!documentGrid) {
    return res.status(400).json({ message: "Error: No data received.", errors: [] });
  }

  // Find the Master Document
  const masterDoc = documentGrid.find(doc => doc.givenName && doc.givenName.trim() !== "");

  if (!masterDoc) {
    return res.json({ message: "Error: Please fill in at least one Given Name to start the analysis.", errors: [] });
  }

  let discrepancies = [];
  let errorCells = []; 
  const fieldsToVerify = ['givenName', 'fatherName', 'motherName', 'spouseName', 'familyName', 'dob', 'place'];

  // Check rows for typos against the master row
  documentGrid.forEach((doc, rowIndex) => {
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
    finalMessage = `Success! All documents match perfectly.`;
  } else {
    const uniqueDiscrepancies = [...new Set(discrepancies)];
    finalMessage = `WARNING - Mismatches found in: ${uniqueDiscrepancies.join(", ")}.`;
  }

  res.json({ message: finalMessage, errors: errorCells });
});

// ==========================================
// 4. DATABASE SEARCH ENGINE (NEW MODAL LOGIC)
// ==========================================
function getVoterMatches(voterList, searchInput) {
    if (!searchInput || searchInput.length < 3) return []; 
    
    const query = searchInput.toLowerCase().trim();
    
    return voterList.filter(voter => {
        const given = voter.givenName || '';
        const father = voter.fatherName || '';
        const family = voter.familyName || '';
        const fullRecordString = `${given} ${father} ${family}`.toLowerCase();
        
        return fullRecordString.includes(query);
    });
}

app.post('/api/search-voter', (req, res) => {
    const { applicantName } = req.body; 

    const matches2002 = getVoterMatches(voterList2002, applicantName);
    const matches2025 = getVoterMatches(voterList2025, applicantName);

    res.json({
        searchQuery: applicantName,
        results2002: matches2002,
        results2025: matches2025,
        totalFound: matches2002.length + matches2025.length
    });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});