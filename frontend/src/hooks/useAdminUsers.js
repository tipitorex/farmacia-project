import { useEffect, useMemo, useState } from "react";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  listRoles,
  updateAdminUser,
} from "../services/adminService";

const USERS_PAGE_SIZE = 8;

export default function useAdminUsers({ canViewUsers }) {
  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");
  const [usersStatusFilter, setUsersStatusFilter] = useState("all");
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [roles, setRoles] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createUserForm, setCreateUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "cliente",
    is_active: true,
  });
  const [editUserForm, setEditUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "cliente",
    is_active: true,
  });

  const roleOptions = useMemo(() => {
    return roles.map((item) => item.nombre);
  }, [roles]);

  const effectiveRoleOptions = roleOptions.length ? roleOptions : ["cliente", "cajero", "farmaceutico", "admin"];

  const totalUsersPages = useMemo(() => {
    return Math.max(1, Math.ceil(usersTotalCount / USERS_PAGE_SIZE));
  }, [usersTotalCount]);

  const hasUsersFilters = useMemo(() => {
    return Boolean(usersSearch.trim()) || usersRoleFilter !== "all" || usersStatusFilter !== "all";
  }, [usersSearch, usersRoleFilter, usersStatusFilter]);

  const paginationRangeText = useMemo(() => {
    if (!usersTotalCount) return "Mostrando 0 de 0 usuarios";
    const start = (usersPage - 1) * USERS_PAGE_SIZE + 1;
    const end = Math.min(usersPage * USERS_PAGE_SIZE, usersTotalCount);
    return `Mostrando ${start}-${end} de ${usersTotalCount} usuarios`;
  }, [usersPage, usersTotalCount]);

  const loadUsers = async (page = usersPage) => {
    if (!canViewUsers) return;

    setUsersLoading(true);
    setUsersError("");

    try {
      const data = await listAdminUsers(undefined, {
        page,
        pageSize: USERS_PAGE_SIZE,
        search: usersSearch,
        role: usersRoleFilter,
        status: usersStatusFilter,
      });

      setUsers(Array.isArray(data?.results) ? data.results : []);
      setUsersTotalCount(Number.isInteger(data?.count) ? data.count : 0);

      const backendPage = page;
      const nextTotalPages = Math.max(1, Math.ceil((data?.count || 0) / USERS_PAGE_SIZE));
      setUsersPage(Math.min(backendPage, nextTotalPages));
    } catch (errorData) {
      setUsersError(errorData?.detail || "No se pudo cargar la lista de usuarios.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!canViewUsers) return;
    try {
      const rolesData = await listRoles(undefined);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch, usersRoleFilter, usersStatusFilter]);

  useEffect(() => {
    loadUsers(usersPage);
  }, [usersPage, usersSearch, usersRoleFilter, usersStatusFilter, canViewUsers]);

  useEffect(() => {
    loadRoles();
  }, [canViewUsers]);

  useEffect(() => {
    if (!effectiveRoleOptions.includes(createUserForm.role)) {
      setCreateUserForm((prev) => ({ ...prev, role: effectiveRoleOptions[0] }));
    }
  }, [effectiveRoleOptions, createUserForm.role]);

  useEffect(() => {
    if (!effectiveRoleOptions.includes(editUserForm.role)) {
      setEditUserForm((prev) => ({ ...prev, role: effectiveRoleOptions[0] }));
    }
  }, [effectiveRoleOptions, editUserForm.role]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreatingUser(true);
    setUsersError("");

    try {
      await createAdminUser(undefined, createUserForm);
      setShowCreateUserModal(false);
      setCreateUserForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "cliente",
        is_active: true,
      });
      setUsersPage(1);
      await loadUsers(1);
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo crear el usuario.");
      } else {
        setUsersError("No se pudo crear el usuario.");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const handleOpenEditUserModal = (targetUser) => {
    setSelectedUser(targetUser);
    setEditUserForm({
      first_name: targetUser.first_name || "",
      last_name: targetUser.last_name || "",
      email: targetUser.email || "",
      password: "",
      role: targetUser.role || "cliente",
      is_active: Boolean(targetUser.is_active),
    });
    setShowEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    setEditUserForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "cliente",
      is_active: true,
    });
  };

  const handleSubmitEditUser = async (event) => {
    event.preventDefault();
    if (!selectedUser?.id) return;

    setUpdatingUser(true);
    setUsersError("");

    const payload = {
      first_name: editUserForm.first_name,
      last_name: editUserForm.last_name,
      email: editUserForm.email,
      role: editUserForm.role,
      is_active: editUserForm.is_active,
    };

    if (editUserForm.password.trim()) {
      payload.password = editUserForm.password;
    }

    try {
      const updated = await updateAdminUser(undefined, selectedUser.id, payload);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      handleCloseEditUserModal();
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo actualizar el usuario.");
      } else {
        setUsersError("No se pudo actualizar el usuario.");
      }
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleOpenDeleteUserModal = (targetUser) => {
    setSelectedUser(targetUser);
    setShowDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!selectedUser?.id) return;

    setDeletingUser(true);
    setUsersError("");

    try {
      await deleteAdminUser(undefined, selectedUser.id);
      setShowDeleteUserModal(false);
      setSelectedUser(null);

      const nextCount = Math.max(0, usersTotalCount - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextCount / USERS_PAGE_SIZE));
      const nextPage = Math.min(usersPage, nextTotalPages);
      setUsersTotalCount(nextCount);
      setUsersPage(nextPage);
      await loadUsers(nextPage);
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo eliminar el usuario.");
      } else {
        setUsersError("No se pudo eliminar el usuario.");
      }
    } finally {
      setDeletingUser(false);
    }
  };

  return {
    users,
    usersSearch,
    setUsersSearch,
    usersRoleFilter,
    setUsersRoleFilter,
    usersStatusFilter,
    setUsersStatusFilter,
    usersError,
    usersLoading,
    usersPage,
    setUsersPage,
    showCreateUserModal,
    setShowCreateUserModal,
    showEditUserModal,
    showDeleteUserModal,
    creatingUser,
    updatingUser,
    deletingUser,
    selectedUser,
    createUserForm,
    setCreateUserForm,
    editUserForm,
    setEditUserForm,
    effectiveRoleOptions,
    totalUsersPages,
    hasUsersFilters,
    paginationRangeText,
    loadUsers,
    handleCreateUser,
    handleOpenEditUserModal,
    handleCloseEditUserModal,
    handleSubmitEditUser,
    handleOpenDeleteUserModal,
    handleCloseDeleteUserModal,
    handleConfirmDeleteUser,
  };
}
