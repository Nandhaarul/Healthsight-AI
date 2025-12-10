import React, { useState, useRef } from "react";
import axios from "axios";
import XrayAnalysis from "./xray";

// Utility: Clean up stray single letters and artifacts from text
function cleanText(text) {
  if (!text) return "";
  // Remove lines that are just a single letter or non-word
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 1 || /^[a-zA-Z0-9]$/.test(line) === false)
    .filter(line => !/^\*?\s?[a-zA-Z]$/.test(line)) // Remove lines like "* a"
    .join('\n')
    .replace(/\s{2,}/g, ' ') // Remove extra spaces
    .replace(/^\s+|\s+$/g, ''); // Trim start/end
}

function PipelineForm() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Classification states
  const [classifyResult, setClassifyResult] = useState(null);
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyError, setClassifyError] = useState("");

  // Object detection states
  const [detections, setDetections] = useState([]);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef();
  const imgRef = useRef();

  // Audio recording states
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);

  // Cough classification states
  const [coughResult, setCoughResult] = useState(null);
  const [coughLoading, setCoughLoading] = useState(false);
  const [coughError, setCoughError] = useState("");

  // Zero Shot
  const [zeroShotResult, setZeroShotResult] = useState(null);
  const [zeroShotLoading, setZeroShotLoading] = useState(false);
  const [zeroShotError, setZeroShotError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
    setDetections([]);
    setResult(null);
    setClassifyResult(null);
    setClassifyError("");
  };

  // Object Detection API call
  const detectObjectsAPI = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await axios.post("http://127.0.0.1:8000/detect-objects/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  // Draw detections on canvas
  const drawDetections = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";
    detections.forEach((det) => {
      const { xmin, ymin, xmax, ymax } = det.box;
      ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
      ctx.fillText(det.label, xmin, ymin > 20 ? ymin - 5 : ymin + 15);
    });
  };

  // Redraw detections whenever detections or preview changes
  React.useEffect(() => {
    if (preview && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      img.onload = () => {
        drawDetections();
      };
      if (img.complete) {
        drawDetections();
      }
    }
    // eslint-disable-next-line
  }, [detections, preview]);

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setDetections([]);
    setQuestion("");
    setResult(null);
    setClassifyResult(null);
    setClassifyError("");
    setAudioURL(null);
    setAudioBlob(null);
    setRecording(false);
    setTranscript("");
    setCoughResult(null);
    setCoughError("");
    setCoughLoading(false);
    setZeroShotResult(null);
    setZeroShotError("");
    setZeroShotLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) {
      alert("Please enter a question or symptoms.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setClassifyResult(null);
    setClassifyError("");
    setResult(null);

    // 1. Object Detection (only if file is present)
    if (file) {
      try {
        const detectionResult = await detectObjectsAPI(file);
        setDetections(detectionResult.detections || []);
      } catch (err) {
        setDetections([]);
        // Optionally show error
      }
    } else {
      setDetections([]);
    }

    // 2. Only classify if the file is likely a skin image (not a document)
    let classifyData = null;
    let isDocument = false;
    if (file) {
      const fileName = file.name.toLowerCase();
      isDocument = fileName.includes("prescription") || fileName.includes("report") || fileName.includes("doc");
      if (!isDocument) {
        const classifyForm = new FormData();
        classifyForm.append("image", file);
        try {
          setClassifyLoading(true);
          const classifyRes = await axios.post(
            "http://127.0.0.1:8000/classify-image-local/",
            classifyForm,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          classifyData = classifyRes.data;
          setClassifyResult(classifyData);
        } catch (err) {
          setClassifyError(err.response?.data?.detail || "Classification failed.");
        }
        setClassifyLoading(false);
      }
    }

    // 3. Run pipeline as before (support text-only)
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("question", question);

    try {
      const res = await axios.post("http://127.0.0.1:8000/pipeline/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ ...res.data, classify: classifyData });
    } catch (err) {
      setResult({ error: err.message, classify: classifyData });
      console.log(err);
    }
    setLoading(false);

    // 4. Zero-Shot Symptom Classification
    setZeroShotResult(null);
    setZeroShotError("");
    setZeroShotLoading(true);
    try {
      const zsRes = await axios.post(
        "http://127.0.0.1:8000/zero-shot-classify/",
        { text: question }
      );
      setZeroShotResult(zsRes.data);
    } catch (err) {
      setZeroShotError(err.response?.data?.detail || "Zero-shot classification failed.");
    }
    setZeroShotLoading(false);
  };

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    setAudioURL(null);
    setAudioBlob(null);
    setTranscript("");
    setCoughResult(null);
    setCoughError("");
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToBackend = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append("audio", audioBlob, "symptoms.wav");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/transcribe-audio/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const data = res.data;
      setTranscript(data.transcript || "");
      setQuestion(data.transcript || "");
    } catch (err) {
      alert("Transcription failed: " + err.message);
    }
  };

  const sendCoughToBackend = async () => {
    if (!audioBlob) return;
    setCoughLoading(true);
    setCoughResult(null);
    setCoughError("");
    const formData = new FormData();
    formData.append("audio", audioBlob, "cough.wav");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/classify-cough/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setCoughResult(res.data);
    } catch (err) {
      setCoughError(err.response?.data?.detail || "Cough classification failed.");
    }
    setCoughLoading(false);
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
                className="block w-full p-3 rounded-lg focus:outline-blue-400 bg-blue-50"
              />
            </div>
            {/* Mic Recording Section */}
            <div>
              <label className="block font-semibold mb-2 text-blue-700">Or Record Symptoms</label>
              <div className="flex gap-2 items-center">
                {!recording ? (
                  <button
                    type="button"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow font-semibold"
                    onClick={startRecording}
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-semibold"
                    onClick={stopRecording}
                  >
                    Stop Recording
                  </button>
                )}
                {audioURL && (
                  <>
                    <audio src={audioURL} controls className="ml-4" />
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold ml-2"
                      onClick={sendAudioToBackend}
                    >
                      Transcribe
                    </button>
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold ml-2"
                      onClick={sendCoughToBackend}
                      disabled={coughLoading}
                    >
                      {coughLoading ? "Classifying..." : "Classify Cough"}
                    </button>
                  </>
                )}
              </div>
              {/* Show transcript if available */}
              {transcript && (
                <div className="mt-2 p-2 bg-blue-50 rounded border text-gray-700">
                  <span className="font-semibold">Transcript:</span>
                  <span className="ml-2">{transcript}</span>
                </div>
              )}
              {/* Show cough classification result */}
              {coughResult && (
                <div className="mt-2 p-2 bg-green-50 rounded border text-gray-700">
                  <span className="font-semibold">Cough Classification:</span>
                  <span className="ml-2">{coughResult.label} (Confidence: {(coughResult.score * 100).toFixed(2)}%)</span>
                </div>
              )}
              {coughError && (
                <div className="mt-2 p-2 bg-red-50 rounded border text-red-700">
                  {coughError}
                </div>
              )}
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

          {/* Object Detection Preview */}
          {preview && (
            <div className="mt-6 flex flex-col items-center">
              <h3 className="font-semibold mb-2 text-blue-700">Detected Objects</h3>
              <img
                ref={imgRef}
                src={preview}
                alt="preview"
                style={{ maxWidth: "100%", marginBottom: "8px", display: "block" }}
                onLoad={drawDetections}
              />
              <canvas ref={canvasRef} style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
              {detections.length > 0 && (
                <ul className="mt-2 text-sm text-gray-700">
                  {detections.map((det, idx) => (
                    <li key={idx}>
                      {det.label} ({Math.round(det.score * 100)}%) - Box: {JSON.stringify(det.box)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Classification Loading/Error */}
          {classifyLoading && <div className="text-blue-600 mt-4">Classifying image...</div>}
          {classifyError && <div className="text-red-500 mt-2">{classifyError}</div>}

          {/* Results */}
          {result && (
            <div className="mt-8 p-4 border rounded-xl bg-blue-50">
              <h3 className="font-semibold mb-4 text-blue-700 text-lg">Results</h3>
              {result.error ? (
                <div className="text-red-500">{result.error}</div>
              ) : (
                <div>
                  {/* AI Diagnosis: Only show if not a document */}
                  {result.classify && !result.is_document && (
                    <div className="mb-4">
                      <span className="font-bold text-gray-700">AI Diagnosis:</span>
                      <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                        {result.classify.diagnosis}{" "}
                        {result.classify.score &&
                          `(Confidence: ${(result.classify.score * 100).toFixed(2)}%)`}
                      </pre>
                    </div>
                  )}
                  {/* If document, show info message */}
                  {result.is_document && (
                    <div className="mb-4 text-gray-400 italic">
                      AI Diagnosis and VQA are not shown for document images.
                    </div>
                  )}
                  {/* Ensemble Approach: Show both model and rule-based results */}
                  {result.is_document && (
                    <div className="mb-4">
                      <div className="mb-2">
                        <span className="font-bold text-blue-800">AI Model Answers</span>
                        <div>
                          <span className="font-bold text-gray-700">DocQA Answer:</span>
                          <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{cleanText(result.docqa_answer)}</pre>
                        </div>
                        <div>
                          <span className="font-bold text-gray-700">Summary:</span>
                          <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{result.summary}</pre>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold text-blue-800">Rule-Based Extraction</span>
                        {result.diagnosis_extracted && (
                          <div>
                            <span className="font-bold text-gray-700">Diagnosis (Extracted):</span>
                            <span className="ml-2">{result.diagnosis_extracted}</span>
                          </div>
                        )}
                        {result.advice_extracted && (
                          <div>
                            <span className="font-bold text-gray-700">Advice (Extracted):</span>
                            <span className="ml-2">{result.advice_extracted}</span>
                          </div>
                        )}
                        {result.medicine_extracted && result.medicine_extracted.length > 0 && (
                          <div>
                            <span className="font-bold text-gray-700">Medicines (Extracted):</span>
                            <ul className="ml-4 list-disc">
                              {result.medicine_extracted.map((med, idx) => (
                                <li key={idx}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Handle no text found in pipeline */}
                  {result.summary === "No text found in the image." ? (
                    <div className="mb-4 text-gray-500">
                      No text found in the image. Only image diagnosis is shown above.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <span className="font-bold text-gray-700">Extracted Text:</span>
                        <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{cleanText(result.extracted_text)}</pre>
                      </div>
                    </>
                  )}
                  {/* VQA Answer: Only show if not a document */}
                  {result.vqa_answer && !result.is_document && (
                    <div className="mb-4">
                      <span className="font-bold text-yellow-700">VQA (BLIP) Answer:</span>
                      <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">{result.vqa_answer}</pre>
                    </div>
                  )}
                  {/* Zero-Shot Symptom Classification Results */}
                  <div className="mb-4">
                    <span className="font-bold text-gray-700">Possible Conditions (AI Suggestion):</span>
                    {zeroShotLoading && <div className="text-blue-600 mt-2">Classifying symptoms...</div>}
                    {zeroShotError && <div className="text-red-500 mt-2">{zeroShotError}</div>}
                    {zeroShotResult && zeroShotResult.labels && (
                      <ul className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                        {zeroShotResult.labels.map((label, idx) => (
                          <li key={label}>
                            {label} ({(zeroShotResult.scores[idx] * 100).toFixed(2)}%)
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* --- X-ray Analysis Section --- */}
          <div className="mt-10">
            <XrayAnalysis />
          </div>
          {/* --- End X-ray Analysis Section --- */}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-blue-700 text-base bg-blue-50 border-t mt-10">
        &copy; {new Date().getFullYear()} HealthSight AI &mdash;
      </footer>
    </div>
  );
}

export default PipelineForm;