/*import React, { useState } from "react";
import axios from "axios";

function ImageDiagnosisForm() {
  const [file, setFile] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDiagnosis("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/classify-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDiagnosis(res.data.diagnosis);
    } catch (err) {
      setDiagnosis("Error getting diagnosis.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Medical Image Diagnosis</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Diagnose"}
        </button>
      </form>
      {diagnosis && <div><strong>Diagnosis:</strong> {diagnosis}</div>}
    </div>
  );
}

export default ImageDiagnosisForm;*/

import React, { useState } from "react";
import axios from "axios";

function ImageDiagnosisForm() {
  const [file, setFile] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDiagnosis("");
    setDetails(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("image", file);
    console.log("Submitting classify-image request...");
    try {
      const res = await axios.post("http://127.0.0.1:8000/classify-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });
      console.log("Response:", res.data);
      setDiagnosis(res.data.diagnosis || "Unknown");
      setDetails(res.data);
    } catch (err) {
      console.error("Classification error:", err);
      setErrorMsg(
        err.response?.data?.detail ||
        err.message ||
        "Error getting diagnosis."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Medical Image Diagnosis</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Diagnose"}
        </button>
      </form>
      {errorMsg && <div style={{ color: "red" }}>Error: {errorMsg}</div>}
      {diagnosis && !errorMsg && (
        <div>
          <strong>Diagnosis:</strong> {diagnosis}
          {details?.score && (
            <div>Confidence: {(details.score * 100).toFixed(2)}%</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageDiagnosisForm;