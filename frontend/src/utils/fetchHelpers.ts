// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("authToken");
  return token
    ? { ...extraHeaders, Authorization: `Bearer ${token}` }
    : { ...extraHeaders };
}

export const basicFetchOptions = () => ({
  method: "GET",
  headers: getAuthHeaders(),
});

export const deleteOptions = {
  method: "DELETE",
  headers: getAuthHeaders(),
};

export const getPostOptions = (body: Record<string, unknown>) => ({
  method: "POST",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const getPatchOptions = (body: Record<string, unknown>) => ({
  method: "PATCH",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const getPutOptions = (body: Record<string, unknown>) => ({
  method: "PUT",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const fetchHandler = async (url: string, options = {}) => {
  try {
    // Ensure URL starts with /api for proxy routing
    const fullUrl = url.startsWith("/api") ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, options);

    const { ok, status, statusText, headers } = response;

    if (!ok) {
      // Create a proper error object with response data
      const error = new Error(`HTTP ${status}: ${statusText}`);
      (
        error as unknown as {
          response: { status: number; statusText: string; data: unknown };
        }
      ).response = {
        status,
        statusText,
        data: await response.json().catch(() => ({ error: statusText })),
      };
      throw error;
    }

    const isJson = (headers.get("content-type") || "").includes(
      "application/json"
    );
    const responseData = await (isJson ? response.json() : response.text());

    return [responseData, null];
  } catch (error) {
    console.warn("fetchHandler error:", error);
    return [null, error];
  }
};
