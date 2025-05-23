import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaUserTie,
  FaFileAlt,
  FaChartLine,
  FaHistory,
} from "react-icons/fa";
import Spline from "@splinetool/react-spline";
import { callService } from "../services/api/callService";
import { voiceAgentService } from "../services/api/voiceAgentService";
import "../styles/Dashboard.css";

// Mock data for demonstration
const mockStats = {
  activeCalls: 3,
  completedInterviews: 12,
  pendingResumes: 8,
  successRate: 85,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "User" }); // Replace with actual user data
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [callsResponse] = await Promise.all([callService.getActiveCalls()]);
      setActiveCalls(callsResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      name: "Virtual Recruiter",
      path: "/virtual-recruiter",
      icon: FaPhone,
      description: "AI-powered voice calls with candidates",
      color: "#3182ce",
      features: [
        "Real-time voice calls",
        "AI conversation",
        "Call recording",
        "Transcript generation",
      ],
    },
    {
      name: "AI Interviewer",
      path: "/interviewer",
      icon: FaUserTie,
      description: "Automated interview system with feedback",
      color: "#38a169",
      features: [
        "Automated interviews",
        "Skill assessment",
        "Feedback generation",
        "Performance analytics",
      ],
    },
    {
      name: "AI Recruiter",
      path: "/recruiter",
      icon: FaFileAlt,
      description: "Resume parsing and candidate matching",
      color: "#805ad5",
      features: [
        "Resume parsing",
        "Skill matching",
        "Candidate ranking",
        "Job matching",
      ],
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2>Welcome back, {user.name}</h2>
        <h2>Toptal MidOffice AI</h2>
      </div>

      <div className="dashboard-content">
        {/* Active Calls Section */}
        <div className="active-calls-section">
          <h3>Active Calls</h3>
          <div className="calls-grid">
            {activeCalls.map((call) => (
              <div key={call.id} className="call-card">
                <div className="call-info">
                  <h4>{call.candidateName}</h4>
                  <p>Duration: {call.duration}</p>
                  <span className={`status ${call.status}`}>{call.status}</span>
                </div>
                <div className="call-actions">
                  <button onClick={() => navigate(`/calls/${call.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Modules */}
        <div className="modules-section">
          <h3>Available Services</h3>
          <div className="modules-grid">
            {modules.map((module) => (
              <div
                key={module.name}
                className="module-card"
                style={{ borderTop: `4px solid ${module.color}` }}
              >
                <div className="module-header">
                  <module.icon
                    className="module-icon"
                    style={{ color: module.color }}
                  />
                  <h3>{module.name}</h3>
                </div>
                <p className="module-description">{module.description}</p>
                <div className="module-features">
                  {module.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  className="module-button"
                  style={{ backgroundColor: module.color }}
                  onClick={() => navigate(module.path)}
                >
                  Access {module.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button
              className="action-button"
              onClick={() => navigate("/virtual-recruiter/new-call")}
            >
              <FaPhone className="action-icon" />
              Start New Call
            </button>
            <button
              className="action-button"
              onClick={() => navigate("/interviewer/schedule")}
            >
              <FaUserTie className="action-icon" />
              Schedule Interview
            </button>
            <button
              className="action-button"
              onClick={() => navigate("/recruiter/upload")}
            >
              <FaFileAlt className="action-icon" />
              Upload Resume
            </button>
            <button
              className="action-button"
              onClick={() => navigate("/history")}
            >
              <FaHistory className="action-icon" />
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-bg">
        <Spline scene="https://prod.spline.design/azAwm0zrmzu6N8Sm/scene.splinecode" />
      </div>
    </div>
  );
};

export default Dashboard;
