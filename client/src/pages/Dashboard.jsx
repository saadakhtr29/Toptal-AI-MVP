import React, { useState } from "react";
import OpsCenter from "../components/OpsCenter";
import TalkTrack from "../components/TalkTrack";
import InsightVault from "../components/InsightVault";
import Spline from "@splinetool/react-spline";
import "../styles/Dashboard.css";
import bgGrid from "../assets/bg-grid.svg";

const Dashboard = () => {
  // Placeholder user
  const user = { name: "Ranjit" };

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
          back {user.name}!
        </div>
        <div className="dashboard-title">Toptal MidOffice AI</div>
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
