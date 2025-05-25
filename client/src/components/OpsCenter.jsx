import React, { useRef, useState } from "react";
import { callService } from "../services/api/callService";
import "../styles/OpsCenter.css";

const OpsCenter = () => {
  const fileInputRef = useRef();
  const [numbers, setNumbers] = useState([]);
  const [activeCallIds, setActiveCallIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      // Split by line, take first column, remove spaces, and validate
      const nums = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0].replace(/\s+/g, "").trim())
        .filter((n) => n.match(/^\+?\d{8,15}$/));
      setNumbers(nums);
      alert(`Loaded ${nums.length} numbers.`);
    };
    reader.readAsText(file);
  };

  const handleStartCalling = async () => {
    if (!numbers.length) {
      alert("Please upload numbers first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to start calls");
      }

      const res = await callService.startBulkCalls({ phoneNumbers: numbers });
      setActiveCallIds(res.data.callIds || []);
      alert("Calling started successfully!");
    } catch (err) {
      console.error("Start calling error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to start calling"
      );
      if (err.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStopCalling = async () => {
    if (!activeCallIds.length) {
      alert("No active calls to stop.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all(activeCallIds.map((id) => callService.endCall(id)));
      setActiveCallIds([]);
      alert("All calls stopped.");
    } catch (err) {
      setError(err.message || "Failed to stop calls");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ops-center-container">
      <div className="ops-center-title">Ops Center</div>
      <ul className="ops-center-list">
        <li>
          <span className="ops-center-dot" /> VocaHire
        </li>
        <li>
          <span className="ops-center-dot" /> IntervuAI
        </li>
        <li>
          <span className="ops-center-dot" /> MatchGenie
        </li>
      </ul>
      <div className="ops-center-upload-section">
        <input
          type="file"
          accept=".csv,.txt"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
        <button
          className="ops-center-upload-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          Upload Numbers
        </button>
        <div className="ops-center-call-controls">
          <button
            className="ops-center-call-btn start"
            onClick={handleStartCalling}
            disabled={loading || !numbers.length}
          >
            {loading ? "Starting..." : "Start Calling"}
          </button>
          <button
            className="ops-center-call-btn stop"
            onClick={handleStopCalling}
            disabled={loading || !activeCallIds.length}
          >
            {loading ? "Stopping..." : "Stop Calling"}
          </button>
        </div>
        {error && <div style={{ color: "#f87171", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
};

export default OpsCenter;
