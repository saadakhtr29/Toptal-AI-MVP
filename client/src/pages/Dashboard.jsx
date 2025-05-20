import React from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  { name: "Virtual Recruiter", path: "/virtual-recruiter" },
  { name: "Interviewer", path: "/interviewer" },
  { name: "AI Recruiter", path: "/recruiter" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
   <h1>hello from Dashboard</h1>
  );
}
