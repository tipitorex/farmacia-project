import { useEffect, useState } from "react";
import {
  createRole,
  deleteRole,
  listPermissionsCatalog,
  listRoles,
  updateRolePermissions,
} from "../services/adminService";

export default function useAdminRolesPermissions({ canManageRoles }) {
  const [roles, setRoles] = useState([]);
  const [permisosCatalogo, setPermisosCatalogo] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedRolePermisos, setSelectedRolePermisos] = useState([]);
  const [savingRole, setSavingRole] = useState(false);
  const [deletingRoleName, setDeletingRoleName] = useState("");

  const loadRolesAndPermissions = async () => {
    if (!canManageRoles) return;

    setRolesLoading(true);
    setRolesError("");

    try {
      const [rolesData, permissionsData] = await Promise.all([
        listRoles(undefined),
        listPermissionsCatalog(undefined),
      ]);

      const normalizedRoles = Array.isArray(rolesData) ? rolesData : [];
      const normalizedPermissions = Array.isArray(permissionsData) ? permissionsData : [];

      setRoles(normalizedRoles);
      setPermisosCatalogo(normalizedPermissions);

      const firstRole = normalizedRoles[0]?.nombre || "";
      setSelectedRoleName((prev) => prev || firstRole);
      if (!selectedRoleName && firstRole) {
        const firstRolePerms = normalizedRoles.find((item) => item.nombre === firstRole)?.permisos || [];
        setSelectedRolePermisos(firstRolePerms);
      }
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudieron cargar roles y permisos.");
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    loadRolesAndPermissions();
  }, [canManageRoles]);

  useEffect(() => {
    if (!selectedRoleName) return;
    const selected = roles.find((item) => item.nombre === selectedRoleName);
    setSelectedRolePermisos(selected?.permisos || []);
  }, [selectedRoleName, roles]);

  const handleCreateRole = async (event) => {
    event.preventDefault();
    if (!newRoleName.trim()) return;

    setSavingRole(true);
    setRolesError("");
    try {
      const created = await createRole(undefined, {
        nombre: newRoleName.trim().toLowerCase(),
        permisos: [],
      });
      setRoles((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNewRoleName("");
      setSelectedRoleName(created.nombre);
      setSelectedRolePermisos(created.permisos || []);
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudo crear el rol.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleName) return;

    setSavingRole(true);
    setRolesError("");
    try {
      const updated = await updateRolePermissions(undefined, selectedRoleName, {
        permisos: selectedRolePermisos,
      });
      setRoles((prev) =>
        prev.map((item) => (item.nombre === updated.nombre ? updated : item)).sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudieron actualizar permisos del rol.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleName) => {
    if (!roleName) return;

    setDeletingRoleName(roleName);
    setRolesError("");

    try {
      await deleteRole(undefined, roleName);
      const nextRoles = roles.filter((item) => item.nombre !== roleName);
      setRoles(nextRoles);
      if (selectedRoleName === roleName) {
        const fallback = nextRoles[0]?.nombre || "";
        setSelectedRoleName(fallback);
        setSelectedRolePermisos(nextRoles.find((item) => item.nombre === fallback)?.permisos || []);
      }
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudo eliminar el rol.");
    } finally {
      setDeletingRoleName("");
    }
  };

  return {
    roles,
    permisosCatalogo,
    rolesLoading,
    rolesError,
    newRoleName,
    setNewRoleName,
    selectedRoleName,
    setSelectedRoleName,
    selectedRolePermisos,
    setSelectedRolePermisos,
    savingRole,
    deletingRoleName,
    loadRolesAndPermissions,
    handleCreateRole,
    handleSaveRolePermissions,
    handleDeleteRole,
  };
}
