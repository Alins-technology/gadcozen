import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, fetchMe } from "../services/authService";
import { getErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("gz_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gz_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("gz_user", JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem("gz_token");
        localStorage.removeItem("gz_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("gz_token", data.token);
    localStorage.setItem("gz_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      persistSession(data);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const data = await registerUser(payload);
      persistSession(data);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gz_token");
    localStorage.removeItem("gz_user");
    setUser(null);
  }, []);

  const updateStoredUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("gz_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        loading,
        login,
        register,
        logout,
        updateStoredUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
