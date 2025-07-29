export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("authToken");
  return token
    ? { ...extraHeaders, Authorization: `Bearer ${token}` }
    : { ...extraHeaders };
}

export const basicFetchOptions = () => ({
  method: "GET",
  credentials: "include",
  headers: getAuthHeaders(),
});

export const deleteOptions = {
  method: "DELETE",
  credentials: "include",
  headers: getAuthHeaders(),
};

export const getPostOptions = (body: any) => ({
  method: "POST",
  credentials: "include",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const getPatchOptions = (body: any) => ({
  method: "PATCH",
  credentials: "include",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const getPutOptions = (body: any) => ({
  method: "PUT",
  credentials: "include",
  headers: getAuthHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(body),
});

export const fetchHandler = async (url: string, options = {}) => {
  try {
    const response = await fetch(url, options);

    const { ok, status, statusText, headers } = response;

    if (!ok)
      throw new Error(`Fetch failed with status - ${status} - ${statusText}`, {
        cause: status,
      });

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
