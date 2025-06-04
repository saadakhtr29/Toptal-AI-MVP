import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import OpsCenter from "../components/OpsCenter";
import TalkTrack from "../components/TalkTrack";
import InsightVault from "../components/InsightVault";
import Spline from "@splinetool/react-spline";
import "../styles/Dashboard.css";
import bgGrid from "../assets/bg-grid.svg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div
      className="dashboard-grid-bg"
      style={{
        backgroundColor: "#000000",
        backgroundImage: `url(${bgGrid})`,
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
        position: "relative",
      }}
    >
      {/* Spline 3D element as a background, centered and large */}
      <div className="dashboard-spline-bg">
        <Spline scene="https://prod.spline.design/azAwm0zrmzu6N8Sm/scene.splinecode" />
      </div>
      {/* Main dashboard content above Spline */}
      <div className="dashboard-header-row">
        <div className="dashboard-welcome">
          Welcome
          <br />
          back {user?.displayName || user?.email?.split("@")[0] || "User"}!
        </div>
        <div className="dashboard-title">Toptal MidOffice AI</div>
        <button
          className="dashboard-logout-btn"
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f87171",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            marginLeft: "auto",
            marginRight: "20px",
          }}
        >
          Logout
        </button>
      </div>
      <div className="dashboard-main-row">
        <div className="dashboard-ops-center">
          <OpsCenter />
        </div>
        <div className="dashboard-orb-center" />
        <div className="dashboard-talktrack">
          <TalkTrack />
        </div>
      </div>
      <div className="dashboard-insight-vault">
        <InsightVault />
      </div>
    </div>
  );
};

export default Dashboard;
