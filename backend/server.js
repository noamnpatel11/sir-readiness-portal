const express = require('express');
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

app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});