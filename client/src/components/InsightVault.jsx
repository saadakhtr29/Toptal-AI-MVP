import React, { useState } from "react";
import "../styles/InsightVault.css";
import apiClient from "../services/api/client";

const InsightVault = ({ interviewId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!interviewId) {
      alert("No report available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/interviews/${interviewId}/report`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `InterviewReport-${interviewId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insightvault-container">
      <button
        className="insightvault-btn"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? "Downloading..." : "Insight Vault"}{" "}
        <span className="insightvault-arrow">&#8595;</span>
      </button>
      {error && <div style={{ color: "#f87171", marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default InsightVault;
