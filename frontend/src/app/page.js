"use client";
import { useState } from 'react';

export default function Home() {
  // --- PART 1: THE CATEGORY CHECKER STATE ---
  const [dobInput, setDobInput] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // --- PART 2: THE DOCUMENT LEDGER STATE ---
  const initialDocuments = [
    { docType: "Birth Certificate", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "10th Marks Card", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "12th Marks Card", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Voter ID", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Aadhar Card", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "PAN Card", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Passport", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" }
  ];

  const [documents, setDocuments] = useState(initialDocuments);
  const [resultMessage, setResultMessage] = useState("");
  const [errors, setErrors] = useState([]);

  // --- LOGIC 1: FETCH CATEGORY ELIGIBILITY ---
  const checkEligibility = async (e) => {
    e.preventDefault();
    if (!dobInput) return;
    setEligibilityLoading(true);
    
    try {
      const res = await fetch(`https://sir-readiness-portal.onrender.com/api/eligibility?dob=${dobInput}`);
      if (res.ok) {
        const data = await res.json();
        setEligibilityResult(data);
      }
    } catch (err) {
      console.error("Eligibility fetch failed:", err);
    } finally {
      setEligibilityLoading(false);
    }
  };

  // --- LOGIC 2: TABLE INPUT & HIGHLIGHTING ---
  const handleInputChange = (rowIndex, fieldName, value) => {
    const updatedDocs = [...documents];
    updatedDocs[rowIndex][fieldName] = value;
    setDocuments(updatedDocs);
    // Clear error for this specific cell when user types
    setErrors(errors.filter(err => !(err.rowIndex === rowIndex && err.field === fieldName)));
  };

  const isErrorCell = (rowIndex, fieldName) => {
    return errors.some(err => err.rowIndex === rowIndex && err.field === fieldName);
  };

  // --- LOGIC 3: ANALYZE THE SPREADSHEET ---
  const handleAnalyzeClick = async () => {
    setResultMessage("Transmitting data grid to server for analysis...");
    setErrors([]); 

    try {
      const response = await fetch('https://sir-readiness-portal.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentGrid: documents }),
      });

      const data = await response.json();
      setResultMessage(data.message || 'Analysis Complete!');
      if (data.errors) setErrors(data.errors);
      
    } catch (error) {
      setResultMessage("Error: Could not establish a connection to the backend server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight text-blue-400">SIR Readiness Portal</h1>
      
      {/* SECTION 1: Category Eligibility Form */}
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto mb-12 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-center">Step 1: Determine Requirement Category</h2>
        <form onSubmit={checkEligibility} className="flex gap-4 items-end">
          <div className="flex-grow">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Applicant Date of Birth</label>
            <input type="date" value={dobInput} onChange={(e) => setDobInput(e.target.value)} required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" />
          </div>
          <button type="submit" disabled={eligibilityLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition">
            {eligibilityLoading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {eligibilityResult && (
          <div className="mt-6 p-5 bg-slate-950 rounded-lg border border-blue-900">
            <h3 className="text-lg font-bold text-blue-400 mb-2">{eligibilityResult.category}</h3>
            <p className="text-sm text-slate-300 mb-3">{eligibilityResult.message}</p>
            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-300">
              {eligibilityResult.missingDocs?.map((doc, idx) => (
                <li key={idx}><span className="text-blue-500 mr-2">▹</span>{doc}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION 2: Document Master Ledger */}
      <div className="bg-white text-black p-6 rounded-lg shadow-xl w-full overflow-x-auto border border-slate-300">
        <h2 className="text-xl font-semibold mb-4">Step 2: Document Master Ledger Validation</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Document Type</th>
                <th className="border p-2">Given Name</th>
                <th className="border p-2">Father Name</th>
                <th className="border p-2">Mother Name</th>
                <th className="border p-2">Spouse Name</th>
                <th className="border p-2">Family Name</th>
                <th className="border p-2 bg-blue-100">DOB</th>
                <th className="border p-2 bg-blue-100">Place of Birth</th>
                <th className="border p-2 bg-blue-100">Date Issued</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium bg-gray-100">{doc.docType}</td>
                  
                  {/* Name Fields */}
                  <td className="border p-0">
                    <input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'givenName') ? 'bg-red-200 border-2 border-red-500 text-red-900 font-bold' : 'focus:bg-blue-50'}`} value={doc.givenName} onChange={(e) => handleInputChange(index, 'givenName', e.target.value)} />
                  </td>
                  <td className="border p-0"><input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'fatherName') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.fatherName} onChange={(e) => handleInputChange(index, 'fatherName', e.target.value)} /></td>
                  <td className="border p-0"><input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'motherName') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.motherName} onChange={(e) => handleInputChange(index, 'motherName', e.target.value)} /></td>
                  <td className="border p-0"><input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'spouseName') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.spouseName} onChange={(e) => handleInputChange(index, 'spouseName', e.target.value)} /></td>
                  <td className="border p-0"><input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'familyName') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.familyName} onChange={(e) => handleInputChange(index, 'familyName', e.target.value)} /></td>
                  
                  {/* New Columns */}
                  <td className="border p-0"><input type="date" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'dob') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.dob} onChange={(e) => handleInputChange(index, 'dob', e.target.value)} /></td>
                  <td className="border p-0"><input type="text" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'place') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.place} onChange={(e) => handleInputChange(index, 'place', e.target.value)} /></td>
                  <td className="border p-0"><input type="date" className={`w-full h-full p-2 outline-none ${isErrorCell(index, 'dated') ? 'bg-red-200 border-2 border-red-500' : 'focus:bg-blue-50'}`} value={doc.dated} onChange={(e) => handleInputChange(index, 'dated', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAnalyzeClick} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors">
          Analyze Grid for Discrepancies
        </button>

        {resultMessage && (
          <div className={`mt-4 p-4 rounded text-center font-medium ${resultMessage.includes("Error") || resultMessage.includes("WARNING") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-800 border border-green-300"}`}>
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
}