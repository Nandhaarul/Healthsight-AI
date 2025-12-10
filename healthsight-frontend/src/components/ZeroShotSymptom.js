/*import React, { useState } from "react";
import axios from "axios";

const possibleConditions = [
  "Pneumonia", "COVID-19", "Asthma", "Tuberculosis", "Bronchitis", "Dermatitis", "Psoriasis", "Cardiomegaly"
];

function ZeroShotSymptom() {
  const [zsInput, setZsInput] = useState("");
  const [zsResult, setZsResult] = useState(null);
  const [zsLoading, setZsLoading] = useState(false);

  const handleZeroShot = async () => {
    setZsLoading(true);
    setZsResult(null);
    try {
      const res = await axios.post("http://127.0.0.1:8000/zero-shot-classify/", {
        text: zsInput,
        labels: possibleConditions
      });
      setZsResult(res.data);
    } catch (err) {
      setZsResult({ error: err.message });
    }
    setZsLoading(false);
  };

  return (
    <div className="mt-10 p-4 border rounded-xl bg-green-50 max-w-xl mx-auto">
      <h3 className="font-semibold mb-2 text-green-700">Zero-Shot Symptom Classification</h3>
      <input
        type="text"
        placeholder="Describe your symptoms..."
        value={zsInput}
        onChange={e => setZsInput(e.target.value)}
        className="block w-full p-2 border rounded mb-2"
      />
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        onClick={handleZeroShot}
        disabled={zsLoading}
        type="button"
      >
        {zsLoading ? "Classifying..." : "Classify"}
      </button>
      {zsResult && zsResult.labels && (
        <ul className="mt-2">
          {zsResult.labels.map((label, idx) => (
            <li key={label}>
              {label} ({(zsResult.scores[idx] * 100).toFixed(2)}%)
            </li>
          ))}
        </ul>
      )}
      {zsResult && zsResult.error && (
        <div className="text-red-600 mt-2">{zsResult.error}</div>
      )}
    </div>
  );
}

export default ZeroShotSymptom;*/

import React, { useState } from "react";

function ZeroShotSymptom() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const response = await fetch("http://127.0.0.1:8000/zero-shot-classify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <h2>Zero-Shot Symptom Classification</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your symptoms"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Classifying..." : "Classify"}
        </button>
      </form>
      {result && (
        <div>
          <h3>Results:</h3>
          <ul>
            {result.labels.map((label, idx) => (
              <li key={label}>
                {label} ({(result.scores[idx] * 100).toFixed(2)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ZeroShotSymptom;