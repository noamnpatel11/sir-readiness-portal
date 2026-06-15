const express = require('express');
const stringSimilarity = require('string-similarity');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Your Health Check Route
app.get('/', (req, res) => {
  res.send('SIR Readiness Portal Backend is running successfully!');
});

// ==========================================
// NEW: SIR Eligibility Logic Engine
// ==========================================
app.get('/api/eligibility', (req, res) => {
  // Grab the date of birth (dob) from the URL
  const userDOB = req.query.dob;

  // If the user forgot to enter a date, tell them!
  if (!userDOB) {
    return res.status(400).json({ 
      error: "Please provide a date of birth using ?dob=YYYY-MM-DD" 
    });
  }

  // Convert the text dates into actual JavaScript Dates so we can do math with them
  const birthDate = new Date(userDOB);
  const cutoff1987 = new Date('1987-07-01');
  const cutoff2004 = new Date('2004-12-02');

  // Category A Logic
  if (birthDate < cutoff1987) {
    return res.json({
      category: "Category A",
      message: "Only applicant’s proof of date/place of birth is required.",
      missingDocs: ["Self Documents"]
    });
  } 
  
  // Category B Logic
  if (birthDate >= cutoff1987 && birthDate <= cutoff2004) {
    return res.json({
      category: "Category B",
      message: "Applicant proof plus proof of either father or mother is required.",
      missingDocs: ["Self Documents", "Father OR Mother Documents"]
    });
  } 
  
  // Category C Logic
  if (birthDate > cutoff2004) {
    return res.json({
      category: "Category C",
      message: "Applicant proof, father’s proof, and mother’s proof are required.",
      missingDocs: ["Self Documents", "Father Documents", "Mother Documents"]
    });
  }
});

// This route catches the POST request from your Next.js frontend
app.post('/analyze', (req, res) => {
  const { documentGrid } = req.body;
  
  const masterDoc = documentGrid.find(doc => doc.givenName !== "");

  if (!masterDoc) {
    return res.json({ message: "Error: Please fill in at least one Given Name to start the analysis.", errors: [] });
  }

  let discrepancies = [];
  let errorCells = []; // NEW: This will store the exact coordinates of the mistakes

  // We added 'index' here so we know exactly which row we are looking at
  documentGrid.forEach((doc, index) => {
    if (doc.givenName !== "" && doc.docType !== masterDoc.docType) {
      
      const similarityScore = stringSimilarity.compareTwoStrings(
        masterDoc.givenName.toLowerCase(), 
        doc.givenName.toLowerCase()
      );

      if (similarityScore < 1) {
        const matchPercent = Math.round(similarityScore * 100);
        discrepancies.push(`${doc.docType} (${matchPercent}%)`);
        
        // NEW: Tell the frontend EXACTLY where the error is (Row Number, Column Name)
        errorCells.push({ rowIndex: index, field: 'givenName' });
      }
    }
  });

  if (discrepancies.length === 0) {
    res.json({ message: `Success! All documents match the Master (${masterDoc.docType}).`, errors: [] });
  } else {
    res.json({ message: `WARNING - Mismatches found in: ${discrepancies.join(", ")}`, errors: errorCells });
  }
});

  // 3. This array will hold all the spelling mistakes we find
  let discrepancies = [];

  // 4. Compare every row against the Master Document
  documentGrid.forEach((doc) => {
    // Only check rows where they actually typed a name, and don't compare the master to itself!
    if (doc.givenName !== "" && doc.docType !== masterDoc.docType) {
      
      // Calculate how similar the names are (returns a number between 0 and 1)
      const similarityScore = stringSimilarity.compareTwoStrings(
        masterDoc.givenName.toLowerCase(), 
        doc.givenName.toLowerCase()
      );

      // If it is NOT a perfect 1.0 (100% match), flag it!
      if (similarityScore < 1) {
        const matchPercent = Math.round(similarityScore * 100);
        discrepancies.push(`Spelling mismatch in ${doc.docType}: '${doc.givenName}' is only a ${matchPercent}% match to Master ('${masterDoc.givenName}')`);
      }
    }
  });

  // 5. Send the final report back to the frontend
  if (discrepancies.length === 0) {
    res.json({ message: `Success! All documents perfectly match the Master (${masterDoc.docType}).` });
  } else {
    res.json({ message: `WARNING - ${discrepancies.join(" | ")}` });
  }
});

app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});