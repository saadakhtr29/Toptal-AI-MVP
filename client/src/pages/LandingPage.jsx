import React from "react";
import "../styles/landingPage.css";
import Spline from "@splinetool/react-spline";
import { Navigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  // const navigate = useNavigate();
  return (
    <>
      <div className="navbar-container">
        <div className="navbar">
          <span className="logo">Toptal MidOffice AI</span>
          <div className="links">
            <a href="" onClick={() => scrollToSection()}>
              Home
            </a>
            <a href="" onClick={() => scrollToSection()}>
              Features
            </a>
            <a href="" onClick={() => scrollToSection()}>
              About
            </a>
          </div>
        </div>
      </div>
      <div className="heroSection">
        <Spline scene="https://prod.spline.design/8F9hP8ySMi-xWUBC/scene.splinecode" />
      </div>
      <div className="about-container">
       <div className="about-content">
       <h1 className="about-title">“What is a Mid-Office AI Suite?”</h1>
        <p className="about-text">
          Lorem ipsum dolor sit amet consectetur. Suspendisse quisque odio
          iaculis nulla nunc orci congue praesent. Risus turpis et euismod
          varius eu velit eget urna nec. Mauris in rutrum eu dui cursus risus.
          Mauris facilisi eget id semper eget.
          Lorem ipsum dolor sit amet consectetur. Suspendisse quisque odio
          iaculis nulla nunc orci congue praesent. Risus turpis et euismod
          varius eu velit eget urna nec. Mauris in rutrum eu dui cursus risus.
          Mauris facilisi eget id semper eget.
        </p>
       </div>
      </div>
      <div className="features-container">
        <h1>“Everything You Need to Hire – Unified in One Suite”</h1>
      </div>
      <div className="working-container">
        <h1 className="opener">“3 Steps to Power Your Mid-Office with AI”</h1>
        <div className="cards-container">
          <div className="cards">
            <h2>Log in to the Mid-Office Dashboard</h2>
            <p >Manage roles, branding, and modules under one unified hub.</p>
          </div>
          <div className="cards">
            <h2 className="card-title">Use the AI Modules</h2>
            <p >Leverage Mid-Office Recruiter, Interviewer, and Sourcer in real-time.</p>
          </div>
          <div className="cards">
            <h2 className="card-title">Get Results Fast</h2>
            <p >Book meetings, download reports, and scale recruiting</p>
          </div>
        </div>
        <h1 className="closer">Ready to Supercharge Your Hiring?</h1>
        <button className="bottom-btn" onClick={()=> Navigate("/signup")}>Launch Your AI Mid-Office</button>
      </div>
      <div className="footer-container">
        <p className="copyright-text">Copyright © 2025 Toptal AI. All rights reserved.</p>
      </div>
    </>
  );
}
