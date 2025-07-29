import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../api/auth";

const LoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      window.location.href = "/game";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-page-bg">
        <div className="login-form-container">
          <h1 className="login-title">Login</h1>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <form
            className="login-form"
            onSubmit={handleSubmit}
            aria-label="Login form"
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
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              aria-label="Password"
              autoComplete="current-password"
              required
            />
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
