import React, { useState } from "react";
import axios from "axios";

function PipelineForm() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setQuestion("");
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !question) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const res = await axios.post("http://127.0.0.1:8000/pipeline/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-white shadow-sm border-b">
        <div className="flex items-center gap-3">
          {/* Logo (simple heart icon) */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-5.434-7-10A5 5 0 0 1 12 6a5 5 0 0 1 7 5c0 4.566-7 10-7 10z" stroke="#2563eb" strokeWidth="2" fill="none"/>
          </svg>
          <div>
            <span className="text-2xl font-bold text-blue-700">HealthSight AI</span>
            <div className="text-xs text-gray-500">Medical Pre-Diagnosis Assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="none"/>
            <path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-xs text-green-600 font-semibold">HIPAA Compliant</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Brain icon */}
        <div className="mt-10 mb-4 flex justify-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C7.03 2 3 6.03 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9z" fill="#e0e7ff"/>
            <path d="M12 2v18M3 11h18" stroke="#2563eb" strokeWidth="2"/>
            <path d="M8 11v4M16 11v4" stroke="#2563eb" strokeWidth="2"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-2">HealthSight AI</h1>
        <p className="text-lg text-gray-600 text-center mb-6">
          Multimodal AI Assistant for Medical Pre-Diagnosis Support
        </p>
        <p className="text-sm text-gray-500 text-center mb-8 max-w-xl">
          Upload medical documents, describe symptoms, and get AI-powered insights to better understand your health information. Always consult healthcare professionals.
        </p>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2 text-blue-700">
                <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 19V6M5 12l7-7 7 7" stroke="#2563eb" strokeWidth="2" fill="none"/>
                </svg>
                Upload Medical Document
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full p-3 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 focus:outline-blue-400"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-blue-700">Your Question</label>
              <input
                type="text"
                placeholder="e.g. What is the diagnosis?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="block w-full p-3 border rounded-lg focus:outline-blue-400 bg-blue-50"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition flex items-center justify-center font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing...
                  </span>
                ) : "Analyze"}
              </button>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg shadow font-semibold"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 p-4 border rounded-xl bg-blue-50">
              <h3 className="font-semibold mb-4 text-blue-700 text-lg">Results</h3>
              {result.error ? (
                <div className="text-red-500">{result.error}</div>
              ) : (
                <div>
                  <div className="mb-4">
                    <span className="font-bold text-gray-700">Extracted Text:</span>
                    <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{result.extracted_text}</pre>
                  </div>
                  <div className="mb-4">
                    <span className="font-bold text-gray-700">DocQA Answer:</span>
                    <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{result.docqa_answer}</pre>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Summary:</span>
                    <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{result.summary}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-blue-700 text-base bg-blue-50 border-t mt-10">
        &copy; {new Date().getFullYear()} HealthSight AI &mdash; Powered by FastAPI & React
      </footer>
    </div>
  );
}

export default PipelineForm;