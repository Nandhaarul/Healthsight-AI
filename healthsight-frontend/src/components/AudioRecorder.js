import React, { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";

function AudioRecorder({ onTranscript }) {
  const [record, setRecord] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const startRecording = () => setRecord(true);
  const stopRecording = () => setRecord(false);

  const onStop = (recordedData) => {
    setAudioBlob(recordedData.blob);
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/transcribe-audio/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onTranscript(res.data.transcript);
    } catch (err) {
      alert("Transcription failed.");
    }
    setLoading(false);
  };

  return (
    <div>
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        mimeType="audio/wav"
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <button onClick={startRecording} disabled={record}>Start</button>
      <button onClick={stopRecording} disabled={!record}>Stop</button>
      <button onClick={handleUpload} disabled={!audioBlob || loading}>
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
    </div>
  );
}

export default AudioRecorder;