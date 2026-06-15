'use client';
import { useState } from 'react';

export default function Home() {
  // 1. THE MEMORY: We tell React to create a "save slot" for each box
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [isMarried, setIsMarried] = useState(false);
  const [spouseName, setSpouseName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [dob, setDob] = useState('');
  
  // This will store the message we show after clicking the button
  const [resultMessage, setResultMessage] = useState('');

  // 2. THE ACTION: What happens when the button is clicked
  const handleAnalyzeClick = () => {
    // For now, let's just prove the app is reading the data!
    if (!name || !familyName) {
      setResultMessage("Please fill in at least your Individual Name and Family Name!");
    } else {
      setResultMessage(`Awesome! The system successfully captured the data for ${name} ${familyName}. We are ready for Step 3!`);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">SIR Readiness Portal</h1>
      
      <div className="flex flex-col gap-4 border border-gray-200 p-6 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Enter Your Details</h2>
        
        {/* 3. WIRING IT UP: We connect each input to its specific "memory" slot */}
        <input 
          type="text" 
          placeholder="01. Individual Name" 
          className="border border-gray-300 p-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="02. Father Name" 
          className="border border-gray-300 p-2 rounded text-black"
          value={fatherName}
          onChange={(e) => setFatherName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="03. Mother Name" 
          className="border border-gray-300 p-2 rounded text-black"
          value={motherName}
          onChange={(e) => setMotherName(e.target.value)} 
        />
        
        <label className="flex items-center gap-2 mt-2 text-gray-700">
          <input 
            type="checkbox" 
            className="w-4 h-4"
            checked={isMarried}
            onChange={(e) => setIsMarried(e.target.checked)}
          />
          I am married (Check to add spouse)
        </label>
        
        {/* If 'isMarried' is true, show this box. If false, hide it! */}
        {isMarried && (
          <input 
            type="text" 
            placeholder="04. Spouse Name" 
            className="border border-gray-300 p-2 rounded text-black"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)} 
          />
        )}

        <input 
          type="text" 
          placeholder="05. Family Name (Surname)" 
          className="border border-gray-300 p-2 rounded mt-2 text-black"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)} 
        />
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">06. Date of Birth</label>
          <input 
            type="date" 
            className="border border-gray-300 p-2 rounded text-black"
            value={dob}
            onChange={(e) => setDob(e.target.value)} 
          />
        </div>

        {/* We connect the button to our action function */}
        <button 
          onClick={handleAnalyzeClick}
          className="bg-blue-600 text-white p-3 rounded mt-4 font-bold hover:bg-blue-700 transition-colors"
        >
          Analyze Details
        </button>

        {/* This is where our success message will pop up */}
        {resultMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded font-medium">
            {resultMessage}
          </div>
        )}
      </div>
    </main>
  );
}