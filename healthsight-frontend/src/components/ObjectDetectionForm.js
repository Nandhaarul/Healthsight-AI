/*import React, { useState, useRef } from "react";

const API_URL = "http://127.0.0.1:8000/detect-objects/";

function ObjectDetectionForm() {
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setDetections([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDetections(data.detections);

    // Draw boxes on canvas
    const img = new window.Image();
    img.src = preview;
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.font = "16px Arial";
      ctx.fillStyle = "red";
      data.detections.forEach((det) => {
        const { xmin, ymin, xmax, ymax } = det.box;
        ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
        ctx.fillText(det.label, xmin, ymin > 20 ? ymin - 5 : ymin + 15);
      });
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Object Detection</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Detect Objects
        </button>
      </form>
      {preview && (
        <div className="mt-4">
          <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
        </div>
      )}
      {detections.length > 0 && (
        <div className="mt-2">
          <h3 className="font-semibold">Detections:</h3>
          <ul>
            {detections.map((det, idx) => (
              <li key={idx}>
                {det.label} ({Math.round(det.score * 100)}%) - Box:{" "}
                {JSON.stringify(det.box)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ObjectDetectionForm;*/


import React, { useState, useRef } from "react";

const API_URL = "http://127.0.0.1:8000/detect-objects/";

function ObjectDetectionForm() {
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef();
  const imgRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setDetections([]);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDetections(data.detections);
    // Drawing will be triggered by useEffect below
  };

  // Redraw detections whenever detections or preview changes
  React.useEffect(() => {
    if (preview && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      img.onload = () => {
        drawDetections();
      };
      // If the image is already loaded (from cache), draw immediately
      if (img.complete) {
        drawDetections();
      }
    }
    // eslint-disable-next-line
  }, [detections, preview]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Object Detection</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Detect Objects
        </button>
      </form>
      {preview && (
        <div className="mt-4">
          {/* Show image for sizing */}
          <img
            ref={imgRef}
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", marginBottom: "8px" }}
            onLoad={drawDetections}
          />
          <canvas ref={canvasRef} style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
        </div>
      )}
      {detections.length > 0 && (
        <div className="mt-2">
          <h3 className="font-semibold">Detections:</h3>
          <ul>
            {detections.map((det, idx) => (
              <li key={idx}>
                {det.label} ({Math.round(det.score * 100)}%) - Box:{" "}
                {JSON.stringify(det.box)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ObjectDetectionForm;