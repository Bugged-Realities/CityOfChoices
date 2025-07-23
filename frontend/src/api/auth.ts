// Utility functions for authentication API (JWT-based)
import {
  fetchHandler,
  basicFetchOptions,
  getPostOptions,
} from "../utils/fetchHelpers";

export async function login(email: string, password: string) {
  const [data, error] = await fetchHandler(
    "/api/auth/login",
    getPostOptions({ email, password })
  );
  if (error) throw error;

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
  const [data, error] = await fetchHandler(
    "/api/auth/signup",
    getPostOptions({ username, email, password })
  );
  if (error) throw error;

  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
}

export async function fetchCharacter() {
  const [data, error] = await fetchHandler(
    "/api/character/me",
    basicFetchOptions()
  );
  if (error) throw error;
  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
}

export function getToken() {
  return localStorage.getItem("authToken");
}
