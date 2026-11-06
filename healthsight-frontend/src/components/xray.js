// Add this inside your PipelineForm component, e.g. below your main form

import React, { useState } from "react";
import axios from "axios";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
function XrayAnalysis() {
  const [xrayFile, setXrayFile] = useState(null);
  const [xrayResult, setXrayResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleXrayChange = (e) => {
    setXrayFile(e.target.files[0]);
    setXrayResult(null);
  };

  const handleXrayAnalyze = async () => {
    if (!xrayFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", xrayFile);
    try {
      const res = await axios.post(`${API_BASE_URL}/classify-xray/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setXrayResult(res.data.predictions);
    } catch (err) {
      setXrayResult([{ label: "Error", score: 0, error: err.message }]);
    }
    setLoading(false);
  };

  return (
    <div className="mt-10 p-4 border rounded-xl bg-gray-50">
      <h3 className="font-semibold mb-2 text-blue-700">X-ray Analysis</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleXrayChange}
        className="block w-full p-2 border rounded mb-2"
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={handleXrayAnalyze}
        disabled={loading}
        type="button"
      >
        {loading ? "Analyzing..." : "Analyze X-ray"}
      </button>
      {xrayResult && (
        <div className="mt-2">
          <h4 className="font-semibold">Predictions:</h4>
          <ul>
            {xrayResult.map((pred, idx) => (
              <li key={idx}>
                {pred.label} ({(pred.probability * 100).toFixed(2)}%)
                {pred.error && <span className="text-red-600 ml-2">{pred.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default XrayAnalysis;