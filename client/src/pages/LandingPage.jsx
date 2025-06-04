import React, { useRef } from "react";
import "../styles/landingPage.css";
import Spline from "@splinetool/react-spline";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  // Refs for sections
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  return (
    <>
      <div className="navbar-container">
        <div className="navbar">
          <span className="logo">Toptal Scoutly AI</span>
          <div className="links">
            <a href="" onClick={() => scrollToSection()}>
              Home
            </a>
            <a href="#features" onClick={() => scrollToSection(featuresRef)}>
              Features
            </a>
            <a href="#about" onClick={() => scrollToSection(aboutRef)}>
              About
            </a>
          </div>
        </div>
        <button className="started-btn" onClick={() => navigate("/signup")}>
          GET STARTED
        </button>
      </div>

      <div className="heroSection">
        <Spline scene="https://prod.spline.design/8F9hP8ySMi-xWUBC/scene.splinecode" />
      </div>
      <div id="about" className="about-container">
        <div className="about-content">
          <h1 className="about-title">“What is a Scoutly AI Suite?”</h1>
          <p className="about-text">
            Toptal Scoutly AI is an all-in-one AI-powered staffing and
            recruitment suite designed to streamline, scale, and supercharge
            your hiring workflow. Built for modern recruitment teams, agencies,
            and fast-growing startups, Scoutly AI blends intelligent automation
            with human-like engagement to help you discover, evaluate, and
            connect with top talent—faster and smarter. Powered by cutting-edge
            large language models and voice technologies, Scoutly AI acts as
            your 24/7 Virtual Recruiter—handling candidate sourcing, screening,
            scheduling, and communication autonomously. Whether you're looking
            to reduce time-to-hire, eliminate manual outreach, or provide a
            better candidate experience, Scoutly AI transforms traditional
            recruitment into a fully automated, intelligent process.
          </p>
        </div>
      </div>
      <div id="features" className="features-container">
        <h1>“Everything You Need to Hire – Unified in One Suite”</h1>
      </div>
      <div className="working-container">
        <h1 className="opener">“3 Steps to Power Your Mid-Office with AI”</h1>
        <div className="cards-container">
          <div className="cards">
            <h2>Log in to the Scoutly Dashboard</h2>
            <p>Manage roles, branding, and modules under one unified hub.</p>
          </div>
          <div className="cards">
            <h2 className="card-title">Use the AI Modules</h2>
            <p>
              Leverage Mid-Office Recruiter, Interviewer, and Sourcer in
              real-time.
            </p>
          </div>
          <div className="cards">
            <h2 className="card-title">Get Results Fast</h2>
            <p>Book meetings, download reports, and scale recruiting</p>
          </div>
        </div>
        <h1 className="closer">Ready to Supercharge Your Hiring?</h1>
        <button className="bottom-btn" onClick={() => navigate("/signup")}>
          Launch Your Scoutly AI
        </button>
      </div>
      <div className="footer-container">
        <p className="copyright-text">
          Copyright © 2025 Toptal AI. All rights reserved.
        </p>
      </div>
    </>
  );
}
