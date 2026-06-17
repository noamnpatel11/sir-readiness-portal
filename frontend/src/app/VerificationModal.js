import React from 'react';

export default function VerificationModal({ isOpen, onClose, searchResults, onSelectRecord }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Search Results: <span className="text-blue-600">"{searchResults?.searchQuery}"</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* 2002 Results */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">2002 Electoral Roll</h3>
            {searchResults?.results2002 && searchResults.results2002.length > 0 ? (
              <div className="space-y-3">
                {searchResults.results2002.map((voter, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{voter.givenName} {voter.familyName}</p>
                      {voter.fatherName && <p className="text-sm text-slate-500">Father: {voter.fatherName}</p>}
                    </div>
                    {/* THIS BUTTON SENDS THE DATA BACK TO PAGE.JS */}
                    <button 
                      onClick={() => onSelectRecord(voter, '2002')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2 rounded-full font-medium transition-colors text-sm"
                    >
                      Verify & Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">No matches found in 2002.</p>
            )}
          </div>

          {/* 2025 Results */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">2025 Electoral Roll</h3>
            {searchResults?.results2025 && searchResults.results2025.length > 0 ? (
              <div className="space-y-3">
                {searchResults.results2025.map((voter, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{voter.givenName} {voter.familyName}</p>
                      {voter.fatherName && <p className="text-sm text-slate-500">Father: {voter.fatherName}</p>}
                    </div>
                    {/* THIS BUTTON SENDS THE DATA BACK TO PAGE.JS */}
                    <button 
                      onClick={() => onSelectRecord(voter, '2025')}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-5 py-2 rounded-full font-medium transition-colors text-sm"
                    >
                      Verify & Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">No matches found in 2025.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}