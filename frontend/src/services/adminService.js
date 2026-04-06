import { getApiBaseUrl, requestJsonWithAuthRetry } from "./apiClient";

function authHeaders(accessToken) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function listAdminUsers(accessToken, params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.role && params.role !== "all") {
    query.set("role", params.role);
  }

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  const queryString = query.toString();
  const endpoint = queryString
    ? `${getApiBaseUrl()}/api/admin/users/?${queryString}`
    : `${getApiBaseUrl()}/api/admin/users/`;

  return requestJsonWithAuthRetry(endpoint, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function updateAdminUser(accessToken, userId, payload) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/users/${userId}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function createAdminUser(accessToken, payload) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/users/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(accessToken, userId) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/users/${userId}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export async function listRoles(accessToken) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/roles/`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function listPermissionsCatalog(accessToken) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/permisos/`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function createRole(accessToken, payload) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/roles/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateRolePermissions(accessToken, roleName, payload) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/roles/${roleName}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteRole(accessToken, roleName) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/roles/${roleName}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
export async function createMedicamento(accessToken, payload) {
  return requestJsonWithAuthRetry(`${getApiBaseUrl()}/api/admin/medicamentos/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      nombre_generico: payload.nombreGenerico,
      nombre_comercial: payload.nombreComercial,
      laboratorio: payload.laboratorio, // Nuevo
      precio: payload.precio // Nuevo
    }),
  });
}

export async function searchMedicamentos(accessToken, nombreGenerico) {
  const endpoint = nombreGenerico 
    ? `${getApiBaseUrl()}/api/admin/medicamentos/?generico=${nombreGenerico}`
    : `${getApiBaseUrl()}/api/admin/medicamentos/`;

  return requestJsonWithAuthRetry(endpoint, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}
export async function deleteMedicamento(accessToken, id) {
  const endpoint = `${getApiBaseUrl()}/api/admin/medicamentos/${id}/`;
  return requestJsonWithAuthRetry(endpoint, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}