import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthProvider";

export default function SignupPage() {
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [loading, setLoading] = useState(false);
  // const toast = useToast();
  // const navigate = useNavigate();
  // const { signup } = useAuth();

  // const handleSignup = async () => {
  //   setLoading(true);
  //   try {
  //     await signup(email, password);
  //     toast({ title: "Account created!", status: "success" });
  //     navigate("/dashboard");
  //   } catch (e) {
  //     toast({
  //       title: "Signup failed",
  //       description: e.message,
  //       status: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    // <div className="signup-page-container">
    //   <h1>Let’s get you started</h1>
    //   <h3>
    //     Already have an account? <a href="/login">Login</a>
    //   </h3>
    //   <input
    //     type="text"
    //     placeholder="First name"
    //     value={firstName}
    //     onChange={(e) => setFirstName(e.target.value)}
    //   />
    //   <input
    //     type="text"
    //     placeholder="Last name"
    //     value={lastName}
    //     onChange={(e) => setLastName(e.target.value)}
    //   />
    //   <input
    //     type="email"
    //     placeholder="Email"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //   />
    //   <input
    //     type="password"
    //     placeholder="Enter your password"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <button onClick={handleSignup} isLoading={loading}>
    //     Create Account
    //   </button>
    //   <button>Sign up with Google</button>
    // </div>
    <h1>hello from signup page</h1>
  );
}
