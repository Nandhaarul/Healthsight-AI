// Place this inside your component (e.g., PipelineForm.js)
import React, { useState } from "react";

function VQASection() {
  const [vqaFile, setVqaFile] = useState(null);
  const [vqaQuestion, setVqaQuestion] = useState("");
  const [vqaAnswer, setVqaAnswer] = useState("");
  const [vqaLoading, setVqaLoading] = useState(false);
  const [vqaError, setVqaError] = useState("");

  const handleVqa = async () => {
    if (!vqaFile || !vqaQuestion) {
      setVqaError("Please upload an image and enter a question.");
      return;
    }
    setVqaLoading(true);
    setVqaAnswer("");
    setVqaError("");
    const formData = new FormData();
    formData.append("image", vqaFile);
    formData.append("question", vqaQuestion);
    try {
      const res = await fetch("http://127.0.0.1:8000/vqa/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("VQA failed");
      const data = await res.json();
      setVqaAnswer(data.answer);
    } catch (err) {
      setVqaError("VQA failed: " + err.message);
    }
    setVqaLoading(false);
  };

  return (
    <div className="mt-10 p-4 border rounded-xl bg-yellow-50">
      <h3 className="font-semibold mb-2 text-yellow-700">Visual Question Answering (AI)</h3>
      <input
        type="file"
        accept="image/*"
        onChange={e => setVqaFile(e.target.files[0])}
        className="block w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        placeholder="Ask a question about the image..."
        value={vqaQuestion}
        onChange={e => setVqaQuestion(e.target.value)}
        className="block w-full p-2 border rounded mb-2"
      />
      <button
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        onClick={handleVqa}
        disabled={vqaLoading}
        type="button"
      >
        {vqaLoading ? "Answering..." : "Ask"}
      </button>
      {vqaAnswer && <div className="mt-2 text-green-700">Answer: {vqaAnswer}</div>}
      {vqaError && <div className="mt-2 text-red-700">{vqaError}</div>}
    </div>
  );
}

export default VQASection;