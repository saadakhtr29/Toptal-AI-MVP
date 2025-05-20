import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
// import { AuthProvider } from "./context/AuthProvider";
// import ProtectedRoute from "./components/ProtectedRoute";

console.log("App.jsx is rendering");

function App() {
  console.log("App rendered");
  return (
    <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
  );
}

export default App;
