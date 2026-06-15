"use client";
import { useState } from 'react';

export default function Home() {
  // 1. Initial Setup: Creating the rows based on your spreadsheet image
  // I added the first 5 common ones to get you started. You can add the rest of the rows later!
const initialDocuments = [
    { docType: "Birth Certificate", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "10th Marks Card", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "12th Marks Card", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Voter ID", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Aadhar Card", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "PAN Card", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" },
    { docType: "Passport", certNo: "", givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: "" }
  ];

  // 2. State: Storing the grid data
  const [documents, setDocuments] = useState(initialDocuments);
  const [resultMessage, setResultMessage] = useState("");

  // 3. The Logic: This function updates the specific cell you type into
  const handleInputChange = (rowIndex, fieldName, value) => {
    const updatedDocs = [...documents];
    updatedDocs[rowIndex][fieldName] = value;
    setDocuments(updatedDocs);
  };

  // 4. The Action: Sending the entire grid to your backend
  const handleAnalyzeClick = async () => {
    setResultMessage("Transmitting data grid to server for analysis...");

    try {
      const response = await fetch('https://sir-readiness-portal.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentGrid: documents }), // Sending the whole array!
      });

      const data = await response.json();
      setResultMessage(`Analysis Complete: ${data.message || 'Grid successfully processed by backend!'}`);
      
    } catch (error) {
      console.error("Connection error:", error);
      setResultMessage("Error: Could not establish a connection to the backend server.");
    }
  };

  // 5. The UI: Rendering the Spreadsheet
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">SIR Readiness Portal</h1>
      
      <div className="bg-white text-black p-6 rounded-lg shadow-xl max-w-[100%] overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Document Master Ledger</h2>
        
        {/* The Spreadsheet Table */}
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Document Type</th>
              <th className="border p-2">Certificate No.</th>
              <th className="border p-2">Given Name</th>
              <th className="border p-2">Father Name</th>
              <th className="border p-2">Mother Name</th>
              <th className="border p-2">Spouse Name</th>
              <th className="border p-2">Family Name</th>
              <th className="border p-2">DOB</th>
              <th className="border p-2">Dated</th>
              <th className="border p-2">Place</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2 font-medium bg-gray-100">{doc.docType}</td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.certNo} onChange={(e) => handleInputChange(index, 'certNo', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.givenName} onChange={(e) => handleInputChange(index, 'givenName', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.fatherName} onChange={(e) => handleInputChange(index, 'fatherName', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.motherName} onChange={(e) => handleInputChange(index, 'motherName', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.spouseName} onChange={(e) => handleInputChange(index, 'spouseName', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.familyName} onChange={(e) => handleInputChange(index, 'familyName', e.target.value)} /></td>
                <td className="border p-0"><input type="date" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.dob} onChange={(e) => handleInputChange(index, 'dob', e.target.value)} /></td>
                <td className="border p-0"><input type="date" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.dated} onChange={(e) => handleInputChange(index, 'dated', e.target.value)} /></td>
                <td className="border p-0"><input type="text" className="w-full h-full p-2 outline-none focus:bg-blue-50" value={doc.place} onChange={(e) => handleInputChange(index, 'place', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          onClick={handleAnalyzeClick} 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Analyze Grid for Discrepancies
        </button>

        {resultMessage && (
          <div className={`mt-4 p-4 rounded text-center font-medium ${resultMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"}`}>
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
}