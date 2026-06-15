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

  // Calculate applicant age
  const dob = new Date(dobParam);
  const ageDiffMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDiffMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  // Define Blueprint Logic
  let responseData = {
    category: "",
    message: "",
    missingDocs: []
  };

  if (age < 18) {
    responseData.category = "Minor Applicant (Under 18)";
    responseData.message = "As a minor applicant, your verification requires parent-linked identity documentation.";
    responseData.missingDocs = ["Birth Certificate", "Father/Mother Identity Proof", "10th Marks Card (if applicable)"];
  } else if (age >= 18 && age < 60) {
    responseData.category = "Standard Adult Applicant (18-59)";
    responseData.message = "Standard administrative verification blueprint applies. Comprehensive identity and address proofs required.";
    responseData.missingDocs = ["Voter ID", "Aadhar Card", "PAN Card", "10th/12th Marks Card"];
  } else {
    responseData.category = "Senior Citizen Applicant (60+)";
    responseData.message = "Senior citizen blueprint activated. Historical records and age-concession proofs prioritized.";
    responseData.missingDocs = ["Voter ID", "Aadhar Card", "PAN / Pension Document"];
  }

  res.json(responseData);
});
// The Main Analysis Engine
app.post('/analyze', (req, res) => {
  const { documentGrid } = req.body;
  
  if (!documentGrid) {
    return res.status(400).json({ message: "Error: No data received.", errors: [] });
  }

  const masterDoc = documentGrid.find(doc => doc.givenName !== "");

  if (!masterDoc) {
    return res.json({ message: "Error: Please fill in at least one Given Name to start the analysis.", errors: [] });
  }

  let discrepancies = [];
  let errorCells = []; 

  documentGrid.forEach((doc, index) => {
    if (doc.givenName !== "" && doc.docType !== masterDoc.docType) {
      const similarityScore = stringSimilarity.compareTwoStrings(
        masterDoc.givenName.toLowerCase(), 
        doc.givenName.toLowerCase()
      );

      if (similarityScore < 1) {
        const matchPercent = Math.round(similarityScore * 100);
        discrepancies.push(`${doc.docType} (${matchPercent}%)`);
        errorCells.push({ rowIndex: index, field: 'givenName' });
      }
    }
  });

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

  let finalMessage = "";
  if (discrepancies.length === 0) {
    finalMessage = `Success! All documents match. `;
  } else {
    finalMessage = `WARNING - Mismatches found in: ${discrepancies.join(", ")}. `;
  }

  finalMessage += `| DB Status -> 2002 Voter List: [${foundIn2002 ? "VERIFIED" : "NOT FOUND"}] | 2025 Voter List: [${foundIn2025 ? "VERIFIED" : "NOT FOUND"}]`;

  res.json({ message: finalMessage, errors: errorCells });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});