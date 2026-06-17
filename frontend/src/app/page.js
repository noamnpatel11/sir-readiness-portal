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

  const [isListed2002, setIsListed2002] = useState(false);
  const [isListed2025, setIsListed2025] = useState(false);
  const [selectedName2002, setSelectedName2002] = useState(null);
  const [selectedName2025, setSelectedName2025] = useState(null);

  // --- PART 3: THE DOCUMENT SPREADSHEET STATE ---
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
      window.location.reload();
    }
  };

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

  const handleInputChange = (rowIndex, fieldName, value) => {
    const updatedDocs = [...documents];
    updatedDocs[rowIndex][fieldName] = value;
    setDocuments(updatedDocs);
    setErrors(errors.filter(err => !(err.rowIndex === rowIndex && err.field === fieldName)));
  };

  // --- UPDATED: Handle Master Selection with Forced Wipe ---
  const handleMasterSelection = (index) => {
    setMasterDocIndex(index);
    setErrors([]); // Explicitly wipe errors
    setResultMessage("⚠️ Master Document changed. Please click 'Run Deep Grid Analysis' again to generate a new report.");
  };

  const isErrorCell = (rowIndex, fieldName) => errors.some(err => err.rowIndex === rowIndex && err.field === fieldName);

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

  const handleExportPDF = () => {
    window.print();
  };

  const renderCell = (index, field, isDate = false) => {
    const value = documents[index][field];
    const hasError = isErrorCell(index, field);
    
    return (
      <div className="h-full w-full print:p-1">
        <input
          type={isDate ? "date" : "text"}
          className={`w-full h-full p-4 outline-none min-w-[140px] transition-all print:hidden ${
            hasError ? 'bg-red-50 border-2 border-red-500 text-red-900 font-bold' : 'bg-transparent text-slate-800'
          }`}
          value={value}
          onChange={(e) => handleInputChange(index, field, e.target.value)}
        />
        <div className={`hidden print:block text-[10px] leading-tight break-words whitespace-normal w-full ${
          hasError ? 'text-red-600 font-bold' : 'text-slate-900'
        }`}>
          {value || "-"}
        </div>
      </div>
    );
  };

  if (!isLoaded) return <div className="min-h-screen bg-white"></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 10mm; }
        }
      `}} />

      <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-8 font-sans pb-32 relative overflow-hidden selection:bg-blue-200 print:p-0 print:pb-0">
        
        <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[600px] bg-green-200/50 rounded-full blur-[100px] pointer-events-none z-0 print:hidden"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[600px] bg-blue-200/50 rounded-full blur-[100px] pointer-events-none z-0 print:hidden"></div>

        <div className="relative z-10 max-w-[95%] xl:max-w-7xl mx-auto pt-10 print:pt-0 print:max-w-full">
          
          <div className="text-center mb-16 print:mb-6 print:text-left">
            <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-slate-900 mb-4 print:text-2xl print:font-bold">
              SIR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 print:text-slate-900">Readiness Portal</span>
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl font-medium print:text-xs print:text-slate-600">Verification Summary & Document Discrepancy Evaluation Report</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 max-w-4xl mx-auto mb-10 print:shadow-none print:border-none print:p-0 print:mb-4">
            <h2 className="text-xl font-semibold mb-6 text-slate-800 print:text-sm print:mb-2 print:border-b print:pb-1">Step 1: Requirement Category</h2>
            
            <form onSubmit={checkEligibility} className="flex flex-col sm:flex-row gap-4 sm:items-end print:hidden">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Applicant Date of Birth</label>
                <input type="date" value={dobInput} onChange={(e) => setDobInput(e.target.value)} required className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-900" />
              </div>
              <button type="submit" disabled={eligibilityLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 px-10 rounded-full">
                {eligibilityLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {dobInput && (
              <div className="hidden print:block text-xs text-slate-700 mb-2">
                <strong>Applicant Date of Birth:</strong> {dobInput}
              </div>
            )}

            {eligibilityResult && (
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 print:mt-2 print:p-3 print:bg-white print:border-slate-300">
                <h3 className="text-xl font-semibold text-blue-700 mb-2 print:text-xs print:text-blue-900">{eligibilityResult.category}</h3>
                <p className="text-slate-600 mb-5 leading-relaxed print:text-xs print:mb-2">{eligibilityResult.message}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 max-w-4xl mx-auto mb-12 print:shadow-none print:border-none print:p-0 print:mb-4">
            <h2 className="text-xl font-semibold mb-6 text-slate-800 print:text-sm print:mb-2 print:border-b print:pb-1">Step 2: Electoral Roll Search & Verification</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 print:hidden">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter full or partial name (e.g., Usman Patel)" className="flex-1 w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-900" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} disabled={isSearchLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-10 rounded-full">
                    {isSearchLoading ? 'Scanning...' : 'Search Database'}
                </button>
            </div>

            <div className="space-y-4 print:space-y-1">
                <div className={`flex items-center gap-4 p-5 rounded-2xl border print:p-1 print:border-none ${selectedName2002 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    {selectedName2002 ? (
                      <div className="flex items-center w-full text-xs">
                        <span className="font-semibold text-slate-900 mr-2">2002 Voter List Record:</span>
                        <span className="text-emerald-800 font-medium bg-emerald-100 px-3 py-1 rounded-full text-sm print:bg-none print:p-0 print:text-[11px] print:font-bold">✓ Verified Status: {selectedName2002}</span>
                        <button onClick={() => {setSelectedName2002(null); setIsListed2002(false);}} className="ml-auto text-sm text-slate-400 hover:text-red-500 print:hidden">Clear</button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600"><span className="font-semibold text-slate-900">2002 Voter List Status:</span> {isListed2002 ? "✓ Manually Confirmed Listed" : "⚠️ Unverified / Not Found"}</div>
                    )}
                </div>

                <div className={`flex items-center gap-4 p-5 rounded-2xl border print:p-1 print:border-none ${selectedName2025 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    {selectedName2025 ? (
                      <div className="flex items-center w-full text-xs">
                        <span className="font-semibold text-slate-900 mr-2">2025 Voter List Record:</span>
                        <span className="text-emerald-800 font-medium bg-emerald-100 px-3 py-1 rounded-full text-sm print:bg-none print:p-0 print:text-[11px] print:font-bold">✓ Verified Status: {selectedName2025}</span>
                        <button onClick={() => {setSelectedName2025(null); setIsListed2025(false);}} className="ml-auto text-sm text-slate-400 hover:text-red-500 print:hidden">Clear</button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600"><span className="font-semibold text-slate-900">2025 Voter List Status:</span> {isListed2025 ? "✓ Manually Confirmed Listed" : "⚠️ Unverified / Not Found"}</div>
                    )}
                </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full mx-auto border border-slate-200 print:shadow-none print:border-none print:p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:mb-2">
              <h2 className="text-xl font-semibold text-slate-800 print:text-sm print:border-b print:pb-1 print:w-full">Step 3: Document Discrepancy Analysis</h2>
              <button onClick={handleClearData} className="text-sm text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-full border border-red-200 hover:bg-red-50 print:hidden">
                Clear Saved Data
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border-2 border-slate-300 print:border-none print:overflow-visible">
              <table className="w-full text-left border-collapse text-sm print:text-[10px] table-fixed print:table-auto">
                <thead className="print:table-header-group">
                  <tr className="bg-slate-100 text-slate-700 print:bg-slate-200 print:text-black">
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-bold text-center w-16 print:p-1">Mstr</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold w-40 print:p-1">Document Type</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Given Name</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Father Name</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Mother Name</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Spouse Name</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Family Name</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">DOB</th>
                    <th className="border-b-2 border-r-2 border-slate-300 p-4 font-semibold print:p-1">Place of Birth</th>
                    <th className="border-b-2 border-slate-300 p-4 font-semibold print:p-1">Date Issued</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {documents.map((doc, index) => {
                    const hasData = Object.values(doc).some(val => val !== "" && val !== doc.docType);
                    return (
                      <tr key={index} className={`transition-colors ${masterDocIndex === index ? 'bg-blue-50/60 print:bg-slate-100' : 'hover:bg-slate-50'} ${!hasData ? 'print:hidden' : ''}`}>
                        
                        <td className="border-b border-r border-slate-300 p-0 text-center align-middle bg-slate-50 print:p-1 print:bg-white">
                          <div className="flex justify-center items-center w-full h-full p-4 print:p-0">
                            <input 
                              type="radio" 
                              name="masterDocument" 
                              checked={masterDocIndex === index} 
                              onChange={() => handleMasterSelection(index)} 
                              className="w-5 h-5 cursor-pointer accent-blue-600 print:hidden"
                            />
                            {masterDocIndex === index && (
                              <span className="hidden print:inline text-black font-bold text-[12px]">[★]</span>
                            )}
                          </div>
                        </td>

                        <td className="border-b border-r border-slate-300 p-4 font-medium text-slate-600 bg-slate-50 print:p-1 print:bg-white print:text-black print:font-bold whitespace-normal">{doc.docType}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'givenName')}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'fatherName')}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'motherName')}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'spouseName')}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'familyName')}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'dob', true)}</td>
                        <td className="border-b border-r border-slate-300 p-0">{renderCell(index, 'place')}</td>
                        <td className="border-b border-slate-300 p-0">{renderCell(index, 'dated', true)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* --- FORCED RE-RENDER SECTION --- */}
            <div key={masterDocIndex} className="mt-8">
                <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <button onClick={handleAnalyzeClick} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-full text-lg shadow-sm">
                        Run Deep Grid Analysis
                    </button>
                    <button onClick={handleExportPDF} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-full text-lg shadow-sm flex items-center justify-center gap-2">
                        Export Report to PDF
                    </button>
                </div>

                {resultMessage && (
                    <div className={`mt-6 p-5 rounded-2xl text-center font-semibold text-lg border print:mt-4 print:p-3 print:text-xs print:text-left ${resultMessage.includes("Error") || resultMessage.includes("WARNING") || resultMessage.includes("changed") ? "bg-red-50 text-red-600 border-red-200 print:border-red-500" : "bg-green-50 text-emerald-700 border-green-200 print:border-slate-400"}`}>
                        <strong className="hidden print:inline">Analysis Findings: </strong> {resultMessage}
                    </div>
                )}
            </div>
          </div>
        </div>

        <VerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} searchResults={searchResults} onSelectRecord={handleSelectVoterFromList} />
      </div>
    </>
  );
}