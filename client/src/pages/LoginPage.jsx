import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthProvider";

export default function LoginPage() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [loading, setLoading] = useState(false);
  // const toast = useToast();
  // const navigate = useNavigate();
  // const { login } = useAuth();

  // const handleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     await login(email, password);
  //     toast({ title: "Welcome back!", status: "success" });
  //     navigate("/dashboard");
  //   } catch (e) {
  //     toast({ title: "Login failed", description: e.message, status: "error" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    // <div className="login-container">
    //   <h1>Welcome back!</h1>
    //   <h3>
    //     Don’t have an account? <a href="/signup">Sign up</a>
    //   </h3>
    //   <input
    //     type="email"
    //     placeholder="Enter your email"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //   />
    //   <input
    //     type="password"
    //     placeholder="Enter your password"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <button onClick={handleLogin} isLoading={loading}>
    //     Login
    //   </button>
    //   <button>Sign in with Google</button>
    // </div>
    <h1>hello from landing page</h1>
  );
}
