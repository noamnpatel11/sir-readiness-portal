'use client';

export default function VerificationModal({ isOpen, onClose, searchResults }) {
    if (!isOpen || !searchResults) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Search Results for: <span className="text-blue-600">"{searchResults.searchQuery}"</span>
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 font-bold text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex gap-6 overflow-y-auto pb-2 flex-1 min-h-0">
                    
                    {/* 2002 Results */}
                    <div className="w-1/2 border border-gray-200 rounded-md p-4 bg-gray-50 shadow-inner overflow-y-auto">
                        <h3 className="font-bold text-lg mb-3 text-blue-700 border-b pb-2 sticky top-0 bg-gray-50">2002 Electoral Roll</h3>
                        {searchResults.results2002.length > 0 ? (
                            <ul className="space-y-3">
                                {searchResults.results2002.map((voter, index) => (
                                    <li key={index} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                                        <p className="text-base text-gray-900"><strong>Name:</strong> {voter.givenName || ''} {voter.familyName || ''}</p>
                                        <p className="text-sm text-gray-600 mt-1"><strong>Father/Husband:</strong> {voter.fatherName || 'N/A'}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-red-500 italic bg-red-50 p-3 rounded border border-red-100">No matches found in 2002.</p>
                        )}
                    </div>

                    {/* 2025 Results */}
                    <div className="w-1/2 border border-gray-200 rounded-md p-4 bg-gray-50 shadow-inner overflow-y-auto">
                        <h3 className="font-bold text-lg mb-3 text-green-700 border-b pb-2 sticky top-0 bg-gray-50">2025 Electoral Roll</h3>
                        {searchResults.results2025.length > 0 ? (
                            <ul className="space-y-3">
                                {searchResults.results2025.map((voter, index) => (
                                    <li key={index} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                                        <p className="text-base text-gray-900"><strong>Name:</strong> {voter.givenName || ''} {voter.familyName || ''}</p>
                                        <p className="text-sm text-gray-600 mt-1"><strong>Father/Husband:</strong> {voter.fatherName || 'N/A'}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-red-500 italic bg-red-50 p-3 rounded border border-red-100">No matches found in 2025.</p>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end border-t pt-4 flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 shadow-md transition"
                    >
                        Acknowledge & Close
                    </button>
                </div>
            </div>
        </div>
    );
}