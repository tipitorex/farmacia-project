import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  canAccessAdmin,
  clearSession,
  getCurrentUser,
  logoutUser,
  saveSession,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        saveSession({ user: data });
        setUser(data);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    saveSession({ user: userData });
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // no-op: local cleanup still runs
    }
    clearSession();
    setUser(null);
  }, []);

  const isAdmin = canAccessAdmin(user);
  const permissions = Array.isArray(user?.permisos) ? user.permisos : [];

  const hasPermission = useCallback(
    (permissionCode) => {
      if (!permissionCode) return true;
      if (isAdmin) return true;
      return permissions.includes(permissionCode);
    },
    [isAdmin, permissions]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
