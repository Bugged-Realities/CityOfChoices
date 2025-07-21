// Utility functions for authentication API (JWT-based)

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.msg || "Login failed.");
  }
  // Store JWT token if present (backend returns 'access_token')
  if (data.access_token) {
    localStorage.setItem("authToken", data.access_token);
  }
  return data;
}

export async function signup(
  username: string,
  email: string,
  password: string
) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Signup failed.");
  }
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
}

export function getToken() {
  return localStorage.getItem("authToken");
}
