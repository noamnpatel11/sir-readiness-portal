"use client";
import { useState, useEffect } from 'react';
import VerificationModal from './VerificationModal';

// Live Render Backend Link
const BACKEND_URL = "https://sir-readiness-portal.onrender.com"; 

export default function Home() {
  // --- PART 1: THE CATEGORY CHECKER STATE ---
  const [dobInput, setDobInput] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // --- PART 2: THE SEARCH ENGINE & LEDGER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Checkbox states (for manual confirmation)
  const [isListed2002, setIsListed2002] = useState(false);
  const [isListed2025, setIsListed2025] = useState(false);
  
  // States to store the actual selected names from the database!
  const [selectedName2002, setSelectedName2002] = useState(null);
  const [selectedName2025, setSelectedName2025] = useState(null);

  // --- PART 3: THE DOCUMENT SPREADSHEET STATE (ALL 24 DOCUMENTS ADDED) ---
  const initialDocuments = [
    "Birth Certificate", "10th LC", "10th Marks Card", "School ID Card", 
    "PUC Leaving Certificates", "PUC Marks Card", "PUC School ID Card", 
    "Degree College LC", "Degree College Marks Card", "Degree College ID Card", 
    "Voter ID (2002 SIR)", "Voter ID (Present)", "PAN Card", "Aadhar Card", 
    "Driving License", "Bank Account", "Ration Card", "House Document", 
    "Plot Document", "Agri Land Document", "Service Document", "Govt. ID", 
    "Residence Certificate", "Passport"
  ].map(docName => ({
    docType: docName, givenName: "", fatherName: "", motherName: "", spouseName: "", familyName: "", dob: "", dated: "", place: ""
  }));

  const [documents, setDocuments] = useState(initialDocuments);
  const [masterDocIndex, setMasterDocIndex] = useState(null); 
  const [resultMessage, setResultMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- SAVE & RESUME LOGIC ---
  useEffect(() => {
    const savedDocs = localStorage.getItem('sirPortalDocs');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    setIsListed2002(localStorage.getItem('listed2002') === 'true');
    setIsListed2025(localStorage.getItem('listed2025') === 'true');
    
    const savedMaster = localStorage.getItem('sirMasterDoc');
    if (savedMaster !== null) setMasterDocIndex(parseInt(savedMaster, 10));

    setSelectedName2002(localStorage.getItem('name2002'));
    setSelectedName2025(localStorage.getItem('name2025'));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sirPortalDocs', JSON.stringify(documents));
      if (masterDocIndex !== null) localStorage.setItem('sirMasterDoc', masterDocIndex);
      if (selectedName2002) localStorage.setItem('name2002', selectedName2002);
      else localStorage.removeItem('name2002');
      if (selectedName2025) localStorage.setItem('name2025', selectedName2025);
      else localStorage.removeItem('name2025');
    }
  }, [documents, masterDocIndex, selectedName2002, selectedName2025, isLoaded]);

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all typed data?")) {
      setDocuments(initialDocuments);
      setMasterDocIndex(null); 
      setResultMessage("");
      setErrors([]);
      localStorage.removeItem('sirPortalDocs');
      localStorage.removeItem('sirMasterDoc');
      
      setIsListed2002(false);
      setIsListed2025(false);
      setSelectedName2002(null);
      setSelectedName2025(null);
      localStorage.removeItem('listed2002');
      localStorage.removeItem('listed2025');
      localStorage.removeItem('name2002');
      localStorage.removeItem('name2025');
    }
  };

  // --- LOGIC 1: FETCH CATEGORY ELIGIBILITY ---
  const checkEligibility = async (e) => {
    e.preventDefault();
    if (!dobInput) return;
    setEligibilityLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/eligibility?dob=${dobInput}`);
      if (res.ok) setEligibilityResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setEligibilityLoading(false);
    }
  };

  // --- LOGIC 2: DATABASE SEARCH ENGINE ---
  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) { alert("Please enter at least 3 characters."); return; }
    setIsSearchLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/search-voter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantName: searchQuery })
      });
      if (!response.ok) throw new Error("Error");
      setSearchResults(await response.json());
      setIsModalOpen(true); 
    } catch (error) {
      alert("Could not reach backend.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  // SELECTING A NAME FROM THE POP-UP
  const handleSelectVoterFromList = (record, year) => {
    const fullName = `${record.givenName || ''} ${record.familyName || ''}`.trim() || record.name;
    
    if (year === '2002') {
      setSelectedName2002(fullName);
      setIsListed2002(true); 
    } else {
      setSelectedName2025(fullName);
      setIsListed2025(true); 
    }
    
    setIsModalOpen(false);
  };

  // --- LOGIC 3: TABLE INPUT & HIGHLIGHTING ---
  const handleInputChange = (rowIndex, fieldName, value) => {
    const updatedDocs = [...documents];
    updatedDocs[rowIndex][fieldName] = value;
    setDocuments(updatedDocs);
    setErrors(errors.filter(err => !(err.rowIndex === rowIndex && err.field === fieldName)));
  };

  const isErrorCell = (rowIndex, fieldName) => errors.some(err => err.rowIndex === rowIndex && err.field === fieldName);

  // --- LOGIC 4: ANALYZE THE SPREADSHEET ---
  const handleAnalyzeClick = async () => {
    if (masterDocIndex === null) {
      setResultMessage("WARNING: Please select a Master Document using the radio buttons on the left before analyzing.");
      return;
    }

    setResultMessage("Transmitting data grid for analysis...");
    setErrors([]); 
    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentGrid: documents, masterIndex: masterDocIndex }), 
      });
      const data = await response.json();
      setResultMessage(data.message || 'Analysis Complete!');
      if (data.errors) setErrors(data.errors);
    } catch (error) {
      setResultMessage("Error: Could not establish connection.");
    }
  };

  // --- LOGIC 5: PRINT/EXPORT TO PDF FUNCTION ---
  const handleExportPDF = () => {
    window.print();
  };

  if (!isLoaded) return <div className="min-h-screen bg-white"></div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-8 font-sans pb-32 relative overflow-hidden selection:bg-blue-200 print:p-0 print:pb-0">
      
      {/* NOTEBOOK LM PASTEL BOTTOM GLOWS - HIDDEN ON PRINT */}
      <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[600px] bg-green-200/50 rounded-full blur-[100px] pointer-events-none z-0 print:hidden"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[600px] bg-blue-200/50 rounded-full blur-[100px] pointer-events-none z-0 print:hidden"></div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10 max-w-[95%] xl:max-w-7xl mx-auto pt-10 print:pt-0 print:max-w-full">
        
        {/* TITLE */}
        <div className="text-center mb-16 print:mb-8 print:text-left">
          <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-slate-900 mb-4 print:text-3xl print:font-bold">
            SIR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 print:text-slate-900">Readiness Portal</span>
          </h1>
          <p className="text-slate-500 text-lg sm:text-xl font-medium print:text-xs print:text-slate-600">Verification Summary & Document Discrepancy Evaluation Report</p>
        </div>
        
        {/* SECTION 1: Category Eligibility Form */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 max-w-4xl mx-auto mb-10 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] print:shadow-none print:border-none print:p-0 print:mb-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 print:text-sm print:mb-2 print:border-b print:pb-1">Step 1: Requirement Category</h2>
          
          <form onSubmit={checkEligibility} className="flex flex-col sm:flex-row gap-4 sm:items-end print:hidden">
            <div className="flex-grow w-full">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Applicant Date of Birth</label>
              <input 
                type="date" 
                value={dobInput} 
                onChange={(e) => setDobInput(e.target.value)} 
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 transition-all duration-200" 
              />
            </div>
            <button 
              type="submit" 
              disabled={eligibilityLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 px-10 rounded-full transition-all duration-200"
            >
              {eligibilityLoading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {/* Render simpler text layout strictly during printing if eligibility is checked */}
          {dobInput && (
            <div className="hidden print:block text-xs text-slate-700 mb-2">
              <strong>Applicant Date of Birth:</strong> {dobInput}
            </div>
          )}

          {eligibilityResult && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 print:mt-2 print:p-4 print:bg-white print:border-slate-300">
              <h3 className="text-xl font-semibold text-blue-700 mb-2 print:text-xs print:text-blue-900">{eligibilityResult.category}</h3>
              <p className="text-slate-600 mb-5 leading-relaxed print:text-xs print:mb-2">{eligibilityResult.message}</p>
              <ul className="grid grid-cols-1 gap-3 print:gap-1">
                {eligibilityResult.missingDocs?.map((doc, idx) => (
                  <li key={idx} className="flex items-center text-slate-700 print:text-xs">
                    <span className="text-blue-500 mr-3 font-bold print:mr-1">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION 2: Electoral Database Search */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 max-w-4xl mx-auto mb-12 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] print:shadow-none print:border-none print:p-0 print:mb-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 print:text-sm print:mb-2 print:border-b print:pb-1">Step 2: Electoral Roll Search & Verification</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8 print:hidden">
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter full or partial name (e.g., Usman Patel)"
                  className="flex-1 w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 transition-all duration-200 placeholder-slate-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                  onClick={handleSearch}
                  disabled={isSearchLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 px-10 rounded-full transition-all duration-200 flex justify-center items-center gap-2"
              >
                  {isSearchLoading ? 'Scanning...' : 'Search Database'}
              </button>
          </div>

          <div className="space-y-4 print:space-y-2">
              {/* 2002 UI LOGIC */}
              <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors print:p-2 print:rounded-none print:border-none ${selectedName2002 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  {selectedName2002 ? (
                    <div className="flex items-center w-full text-xs">
                      <div className="bg-emerald-500 text-white p-1 rounded-full mr-3 print:hidden">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="font-semibold text-slate-900 mr-2">2002 Voter List Record:</span>
                      <span className="text-emerald-800 font-medium bg-emerald-100 px-3 py-1 rounded-full text-sm print:bg-none print:p-0 print:text-xs print:font-bold">✓ Verified Status: {selectedName2002}</span>
                      <button onClick={() => {setSelectedName2002(null); setIsListed2002(false);}} className="ml-auto text-sm text-slate-400 hover:text-red-500 font-medium transition-colors print:hidden">Clear</button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">2002 Voter List Status:</span> {isListed2002 ? "✓ Manually Confirmed Listed" : "⚠️ Unverified / Not Found"}
                    </div>
                  )}
              </div>

              {/* 2025 UI LOGIC */}
              <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors print:p-2 print:rounded-none print:border-none ${selectedName2025 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  {selectedName2025 ? (
                    <div className="flex items-center w-full text-xs">
                      <div className="bg-emerald-500 text-white p-1 rounded-full mr-3 print:hidden">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="font-semibold text-slate-900 mr-2">2025 Voter List Record:</span>
                      <span className="text-emerald-800 font-medium bg-emerald-100 px-3 py-1 rounded-full text-sm print:bg-none print:p-0 print:text-xs print:font-bold">✓ Verified Status: {selectedName2025}</span>
                      <button onClick={() => {setSelectedName2025(null); setIsListed2025(false);}} className="ml-auto text-sm text-slate-400 hover:text-red-500 font-medium transition-colors print:hidden">Clear</button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">2025 Voter List Status:</span> {isListed2025 ? "✓ Manually Confirmed Listed" : "⚠️ Unverified / Not Found"}
                    </div>
                  )}
              </div>
          </div>
        </div>

        {/* SECTION 3: Document Master Ledger */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full mx-auto overflow-hidden border border-slate-200 print:shadow-none print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:mb-2">
            <h2 className="text-xl font-semibold text-slate-800 print:text-sm print:border-b print:pb-1 print:w-full">Step 3: Document Discrepancy Analysis</h2>
            <button onClick={handleClearData} className="text-sm text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-full border border-red-200 hover:bg-red-50 transition-colors print:hidden">
              Clear Saved Data
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-xl border-2 border-slate-300 max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible print:border-none">
            <table className="w-full text-left border-collapse whitespace-nowrap text-sm print:text-[10px]">
              <thead className="sticky top-0 z-10 shadow-sm print:static">
                <tr className="bg-slate-100 text-slate-700 print:bg-slate-200 print:text-black">
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-bold text-center text-blue-700 bg-blue-100/50 print:p-1 print:bg-slate-200 print:text-black">Master</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Document Type</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Given Name</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Father Name</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Mother Name</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Spouse Name</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Family Name</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold text-blue-700 bg-blue-50 print:p-1 print:bg-slate-200 print:text-black">DOB</th>
                  <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold text-blue-700 bg-blue-50 print:p-1 print:bg-slate-200 print:text-black">Place of Birth</th>
                  <th className="border-b-2 border-slate-300 p-4 font-semibold text-blue-700 bg-blue-50 print:p-1 print:bg-slate-200 print:text-black">Date Issued</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {documents.map((doc, index) => {
                  // Only print rows that actually have data filled out to keep the PDF compact and clean
                  const hasData = Object.values(doc).some(val => val !== "" && val !== doc.docType);
                  return (
                    <tr key={index} className={`transition-colors ${masterDocIndex === index ? 'bg-blue-50/60 print:bg-slate-100' : 'hover:bg-slate-50'} ${!hasData ? 'print:hidden' : ''}`}>
                      <td className="border-b border-r border-slate-300 p-0 text-center align-middle bg-slate-50 print:p-1 print:bg-white">
                        <div className="flex justify-center items-center w-full h-full p-4 print:p-0">
                          {masterDocIndex === index ? (
                            <span className="text-blue-600 font-bold print:text-black">[★]</span>
                          ) : (
                            <input 
                              type="radio" 
                              name="masterDocument"
                              checked={masterDocIndex === index}
                              onChange={() => setMasterDocIndex(index)}
                              className="w-5 h-5 cursor-pointer accent-blue-600 print:hidden"
                            />
                          )}
                        </div>
                      </td>
                      <td className="border-b border-r border-slate-300 p-4 font-medium text-slate-600 bg-slate-50 print:p-1 print:bg-white print:text-black print:font-bold">{doc.docType}</td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'givenName') ? 'bg-red-50 border-2 border-red-500 text-red-900 font-bold print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.givenName} onChange={(e) => handleInputChange(index, 'givenName', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'fatherName') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.fatherName} onChange={(e) => handleInputChange(index, 'fatherName', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'motherName') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.motherName} onChange={(e) => handleInputChange(index, 'motherName', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'spouseName') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.spouseName} onChange={(e) => handleInputChange(index, 'spouseName', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'familyName') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.familyName} onChange={(e) => handleInputChange(index, 'familyName', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" placeholder="YYYY-MM-DD" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'dob') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.dob} onChange={(e) => handleInputChange(index, 'dob', e.target.value)} />
                      </td>
                      <td className="border-b border-r border-slate-300 p-0 print:p-1">
                        <input type="text" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'place') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.place} onChange={(e) => handleInputChange(index, 'place', e.target.value)} />
                      </td>
                      <td className="border-b border-slate-300 p-0 print:p-1">
                        <input type="text" placeholder="YYYY-MM-DD" className={`w-full h-full p-4 outline-none transition-all print:p-0 print:text-[10px] ${isErrorCell(index, 'dated') ? 'bg-red-50 border-2 border-red-500 print:text-red-600 print:border-none' : 'bg-transparent text-slate-800'}`} value={doc.dated} onChange={(e) => handleInputChange(index, 'dated', e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DUAL ACTION BUTTONS (HIDDEN ON PDF EXPORTS) */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
            <button 
              onClick={handleAnalyzeClick} 
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-full transition-all duration-200 text-lg shadow-sm active:scale-[0.99]"
            >
              Run Deep Grid Analysis
            </button>
            <button 
              onClick={handleExportPDF} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-full transition-all duration-200 text-lg shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report to PDF
            </button>
          </div>

          {resultMessage && (
            <div className={`mt-6 p-5 rounded-2xl text-center font-semibold text-lg border print:mt-4 print:p-3 print:text-xs print:text-left ${resultMessage.includes("Error") || resultMessage.includes("WARNING") ? "bg-red-50 text-red-600 border-red-200 print:border-red-500" : "bg-green-50 text-emerald-700 border-green-200 print:border-slate-400"}`}>
              <strong className="hidden print:inline">Analysis Findings: </strong> {resultMessage}
            </div>
          )}
        </div>
      </div>

      <VerificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        searchResults={searchResults} 
        onSelectRecord={handleSelectVoterFromList} 
      />
    </div>
  );
}