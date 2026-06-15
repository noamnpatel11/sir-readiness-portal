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

// This route catches the POST request from your Next.js frontend
app.post('/analyze', (req, res) => {
  // 1. Unpack the data sent from the frontend
  const { individualName, fatherName, motherName, isMarried, spouseName, familyName, dob } = req.body;
  
  // 2. Log it to the Render console to prove it arrived
  console.log("Data received from frontend:", req.body);

  // 3. (Future Step) Here is where we will put your uncle's spelling mismatch logic!
  
  // 4. Send a success message back to the frontend
  res.json({ 
    status: "success",
    message: `Backend successfully received data for ${individualName} ${familyName}! The spelling analyzer logic is ready to be built.`
  });
});

app.listen(PORT, () => {
  console.log(`Success! Server is listening on port ${PORT}`);
});