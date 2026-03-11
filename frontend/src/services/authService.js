const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Sesion invalida, vuelve a iniciar sesion.");
  return response.json();
}
