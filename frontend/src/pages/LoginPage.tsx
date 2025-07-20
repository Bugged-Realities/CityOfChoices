import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("Attempting login with:", form);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("Login request sent to /api/auth/login");
      console.log("Response status:", res.status);
      let data;
      try {
        data = await res.clone().json();
        console.log("Response JSON:", data);
      } catch (jsonErr) {
        const text = await res.text();
        console.log("Response not JSON, raw text:", text);
      }
      if (!res.ok) {
        setError("Login failed");
        return;
      }
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/character");
      } else {
        setError("No access token in response");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed: " + err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Login</button>
      </form>
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default LoginPage;
