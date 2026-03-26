const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function request(endpoint, init = {}) {
  return fetch(buildUrl(endpoint), {
    credentials: "include",
    ...init,
  });
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshAuthSession() {
  const response = await request("/api/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("No se pudo refrescar la sesion.");
  }

  return safeParseJson(response);
}

export async function requestWithAuthRetry(endpoint, init = {}) {
  const firstResponse = await request(endpoint, init);
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  try {
    await refreshAuthSession();
  } catch {
    return firstResponse;
  }

  return request(endpoint, init);
}

export async function requestJson(endpoint, init = {}) {
  const response = await request(endpoint, init);
  const data = await safeParseJson(response);

  if (!response.ok) {
    throw data || { detail: "No se pudo completar la solicitud." };
  }

  return data;
}

export async function requestJsonWithAuthRetry(endpoint, init = {}) {
  const response = await requestWithAuthRetry(endpoint, init);
  const data = await safeParseJson(response);

  if (!response.ok) {
    throw data || { detail: "No se pudo completar la solicitud." };
  }

  return data;
}
