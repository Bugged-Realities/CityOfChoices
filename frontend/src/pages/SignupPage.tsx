import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SignupPage: React.FC = () => {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy validation for demonstration
    if (!form.username || !form.email || !form.password) {
      setError("All fields are required.");
    } else {
      setError("");
      // Handle signup logic here
    }
  };

  return (
    <>
      <Header />
      <div className="login-page-bg">
        <div className="login-form-container">
          <h1 className="login-title">Sign Up</h1>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <form
            className="login-form"
            onSubmit={handleSubmit}
            aria-label="Sign up form"
          >
            <input
              className="login-input"
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              aria-label="Username"
              autoComplete="username"
              required
            />
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              aria-label="Email"
              autoComplete="email"
              required
            />
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              aria-label="Password"
              autoComplete="new-password"
              required
            />
            <button className="login-btn" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignupPage;
