import React, { useEffect, useState } from "react";
import { callService } from "../services/api/callService";
import "../styles/TalkTrack.css";

const TalkTrack = ({ callId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!callId) return;
    let interval;
    const fetchConversation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await callService.getCallStatus(callId);
        // Assume res.data.status.conversation is an array of { sender, text }
        setMessages(res.data.status.conversation || []);
      } catch (err) {
        setError(err.message || "Failed to fetch conversation");
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
    interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [callId]);

  return (
    <div className="talktrack-container">
      <div className="talktrack-title">TalkTrack</div>
      <div className="talktrack-messages">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "#f87171" }}>{error}</div>
        ) : messages.length === 0 ? (
          <div style={{ color: "#aaa" }}>No conversation yet.</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`talktrack-msg talktrack-msg-${
                msg.sender?.toLowerCase?.() || "ai"
              }`}
            >
              <span className="talktrack-sender">{msg.sender}:</span> {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TalkTrack;
