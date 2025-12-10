/*import React, { useState } from "react";
import axios from "axios";

function VqaForm() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnswer("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !question) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("question", question);

    try {
      const res = await axios.post("http://127.0.0.1:8000/vqa/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnswer(res.data.answer?.[0]?.answer || JSON.stringify(res.data.answer));
    } catch (err) {
      setAnswer("Error getting answer.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Visual Question Answering (VQA)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <input
          type="text"
          placeholder="Ask a question about the image"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-2 w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Get Answer"}
        </button>
      </form>
      {answer && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
}

export default VqaForm;*/

/*import React, { useState } from "react";
import axios from "axios";

function VqaForm() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnswer("");
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !question) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("question", question);
    console.log("VQA response:", res.data);
    console.log("VQA response (stringified):", JSON.stringify(res.data, null, 2));

    try {
      const res = await axios.post("http://127.0.0.1:8000/vqa/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("VQA response:", res.data); // <-- Debug line
      // Try to display the answer in a robust way
      if (Array.isArray(res.data.answer)) {
        setAnswer(res.data.answer[0]?.answer || JSON.stringify(res.data.answer));
      } else if (typeof res.data.answer === "object" && res.data.answer.answer) {
        setAnswer(res.data.answer.answer);
      } else {
        setAnswer(JSON.stringify(res.data.answer));
      }
    } catch (err) {
      setAnswer("Error getting answer.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Visual Question Answering (VQA)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <input
          type="text"
          placeholder="Ask a question about the image"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-2 w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Get Answer"}
        </button>
      </form>
      {answer && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
}

export default VqaForm;
*/

/*import React, { useState } from "react";
import axios from "axios";

function VqaForm() {
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnswer("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/vqa/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Caption response:", res.data);
      setAnswer(
        Array.isArray(res.data.answer)
          ? res.data.answer[0]
          : JSON.stringify(res.data.answer)
      );
    } catch (err) {
      setAnswer("Error getting caption.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Image Captioning</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Get Caption"}
        </button>
      </form>
      {answer && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Caption:</strong> {answer}
        </div>
      )}
    </div>
  );
}

export default VqaForm;*/

/*import React, { useState } from "react";
import axios from "axios";

function VqaForm() {
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnswer("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/vqa/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Caption response:", res.data);
      setAnswer(
        Array.isArray(res.data.answer)
          ? res.data.answer[0]
          : JSON.stringify(res.data.answer)
      );
      setAnswer(
        Array.isArray(res.data.answer)
          ? res.data.answer[0] // Show the first caption string
          : JSON.stringify(res.data.answer)
      );
    } catch (err) {
      setAnswer("Error getting caption.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Image Captioning</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Get Caption"}
        </button>
      </form>
      {answer && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Caption:</strong> {answer}
        </div>
      )}
    </div>
  );
}

export default VqaForm;*/

import React, { useState } from "react";
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

export default ImageDiagnosisForm;