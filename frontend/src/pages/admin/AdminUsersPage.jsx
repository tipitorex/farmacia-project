import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Alert, AlertDescription } from "../../components/ui/alert";
import CreateUserModal from "../../components/admin/users/CreateUserModal";
import DeleteUserModal from "../../components/admin/users/DeleteUserModal";
import EditUserModal from "../../components/admin/users/EditUserModal";
import UsersPagination from "../../components/admin/users/UsersPagination";
import UsersTable from "../../components/admin/users/UsersTable";
import UsersToolbar from "../../components/admin/users/UsersToolbar";
import { useAuth } from "../../context/AuthContext";
import useAdminUsers from "../../hooks/useAdminUsers";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const canViewUsers = hasPermission("usuarios.ver");
  const canManageUsers = hasPermission("usuarios.gestionar");

  const {
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
  } = useAdminUsers({ canViewUsers });

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!canViewUsers) {
    return (
      <AdminLayout activeSection="users" currentUser={user} onLogout={handleLogout}>
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <h1 className="text-2xl font-black text-slate-900">Admin / Usuarios</h1>
          <p className="mt-2 text-sm text-rose-600">No tienes permisos para ver esta seccion.</p>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="users" currentUser={user} onLogout={handleLogout}>
      <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
        <UsersToolbar
          hasUsersFilters={hasUsersFilters}
          onClearFilters={() => {
            setUsersSearch("");
            setUsersRoleFilter("all");
            setUsersStatusFilter("all");
            setUsersPage(1);
          }}
          canManageUsers={canManageUsers}
          onCreateUser={() => setShowCreateUserModal(true)}
          onRefresh={() => loadUsers(usersPage)}
          usersSearch={usersSearch}
          onUsersSearchChange={setUsersSearch}
          usersRoleFilter={usersRoleFilter}
          onUsersRoleFilterChange={setUsersRoleFilter}
          usersStatusFilter={usersStatusFilter}
          onUsersStatusFilterChange={setUsersStatusFilter}
          effectiveRoleOptions={effectiveRoleOptions}
        />

        {usersError ? (
          <Alert tone="danger" className="mb-3">
            <AlertDescription>{usersError}</AlertDescription>
          </Alert>
        ) : null}

        <UsersTable
          users={users}
          usersLoading={usersLoading}
          hasUsersFilters={hasUsersFilters}
          canManageUsers={canManageUsers}
          onEditUser={handleOpenEditUserModal}
          onDeleteUser={handleOpenDeleteUserModal}
        />

        <UsersPagination
          usersLoading={usersLoading}
          paginationRangeText={paginationRangeText}
          usersPage={usersPage}
          totalUsersPages={totalUsersPages}
          onPreviousPage={() => setUsersPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() => setUsersPage((prev) => Math.min(totalUsersPages, prev + 1))}
        />

        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSubmit={handleCreateUser}
          form={createUserForm}
          onFormChange={setCreateUserForm}
          effectiveRoleOptions={effectiveRoleOptions}
          creatingUser={creatingUser}
        />

        <EditUserModal
          isOpen={showEditUserModal}
          onClose={handleCloseEditUserModal}
          onSubmit={handleSubmitEditUser}
          form={editUserForm}
          onFormChange={setEditUserForm}
          effectiveRoleOptions={effectiveRoleOptions}
          updatingUser={updatingUser}
        />

        <DeleteUserModal
          isOpen={showDeleteUserModal}
          onClose={handleCloseDeleteUserModal}
          onConfirm={handleConfirmDeleteUser}
          deletingUser={deletingUser}
          selectedUser={selectedUser}
        />
      </section>
    </AdminLayout>
  );
}
