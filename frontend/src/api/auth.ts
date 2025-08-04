// Utility functions for authentication API (JWT-based)
import {
  fetchHandler,
  basicFetchOptions,
  getPostOptions,
  deleteOptions,
} from "../utils/fetchHelpers";

export async function login(username: string, password: string) {
  const [data, error] = await fetchHandler(
    "/api/auth/login",
    getPostOptions({ username, password })
  );
  if (error) throw error;

  // Store JWT token if present (backend returns 'access_token')
  if (data && data.access_token) {
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
    "/api/auth/register",
    getPostOptions({ username, email, password })
  );
  if (error) throw error;

  if (data && data.access_token) {
    localStorage.setItem("authToken", data.access_token);
  }
  return data;
}

// Fetch the character and update the character
export async function fetchCharacter() {
  const [data, error] = await fetchHandler(
    "/api/characters/get",
    basicFetchOptions()
  );
  if (error) throw error;
  return data;
}

export async function updateCharacterStats(updates: {
  fear?: number;
  sanity?: number;
}) {
  const [data, error] = await fetchHandler(
    "/api/characters/update-stats",
    getPostOptions(updates)
  );
  if (error) throw error;
  return data;
}

export async function deleteCharacter(characterId: number) {
  const [data, error] = await fetchHandler(
    `/api/characters/${characterId}`,
    deleteOptions
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
