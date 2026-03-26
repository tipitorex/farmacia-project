import { getApiBaseUrl, requestJson, requestWithAuthRetry } from "./apiClient";

export function saveSession({ user }) {
  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem("current_user");
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("current_user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function canAccessAdmin(user) {
  return Boolean(user?.can_access_admin);
}

export async function registerUser(payload) {
  return requestJson("/api/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return requestJson("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail({ uid, token }) {
  return requestJson("/api/auth/verify-email/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token }),
  });
}

export async function getCurrentUser() {
  const response = await requestWithAuthRetry("/api/auth/me/", {});

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const error = new Error(data?.detail || "Sesion invalida, vuelve a iniciar sesion.");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function requestPasswordReset(email) {
  return requestJson("/api/auth/password-reset/request/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset({ uid, token, password, passwordConfirm }) {
  return requestJson("/api/auth/password-reset/confirm/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, password, password_confirm: passwordConfirm }),
  });
}

export async function logoutUser() {
  return requestJson("/api/auth/logout/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export { getApiBaseUrl };
