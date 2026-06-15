'use client';
import { useState } from 'react';

export default function Home() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEligibility = async (e) => {
    e.preventDefault();
    if (!dob) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Connects directly to the backend server running on Port 5000
      const res = await fetch(`http://https://sir-readiness-portal.onrender.com/api/eligibility?dob=${dob}`);
      if (!res.ok) {
        throw new Error('Failed to get information from backend');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Could not connect to the backend server. Make sure your backend terminal is running on port 5000!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-blue-400">
          SIR Portal
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Verify your document criteria instantly based on your age classification category.
        </p>
        
        <form onSubmit={checkEligibility} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Date of Birth
            </label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Processing System Logic...' : 'Analyze Status Requirements'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-950/50 border border-red-800 text-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 p-5 bg-slate-950 rounded-lg border border-blue-900">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-blue-400">{result.category}</h2>
              <span className="px-2.5 py-0.5 bg-blue-900/50 text-blue-300 rounded-full text-xs font-medium border border-blue-700">
                Active Rule
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">{result.message}</p>
            
            <div className="h-px bg-slate-800 my-4" />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Required Documents Blueprint:
            </div>
            <ul className="space-y-2">
              {result.missingDocs.map((doc, idx) => (
                <li key={idx} className="flex items-center text-sm text-slate-300">
                  <span className="mr-2 text-blue-500">▹</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}