import { Button } from "../../ui/button";

export default function UsersPagination({ usersLoading, paginationRangeText, usersPage, totalUsersPages, onPreviousPage, onNextPage }) {
  if (usersLoading) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-600">{paginationRangeText}</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onPreviousPage} disabled={usersPage <= 1}>
          Anterior
        </Button>
        <span className="text-xs font-bold text-slate-700">
          Pagina {usersPage} de {totalUsersPages}
        </span>
        <Button variant="secondary" size="sm" onClick={onNextPage} disabled={usersPage >= totalUsersPages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
