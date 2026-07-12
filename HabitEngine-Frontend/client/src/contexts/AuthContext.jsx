import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshAccessToken: async () => {},
  updateUser: () => {},
});

/**
 * Authentication provider that manages user session state.
 *
 * On mount, checks localStorage for existing tokens and validates
 * them by calling /auth/me. Provides login, register, logout,
 * and token refresh functions to child components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshTokenState, setRefreshTokenState] = useState(() =>
    localStorage.getItem("refreshToken")
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Validate existing session on mount
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await authApi.me();
        setUser(result.data);
      } catch {
        // Token is invalid — clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setRefreshTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password });
    // result.data is the AuthResponse object (token, refreshToken, userId, username, email, etc.)
    const authData = result.data;
    const { token: newToken, refreshToken: newRefresh, ...userData } = authData;

    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefresh);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setRefreshTokenState(newRefresh);
    setUser(userData);

    return result;
  }, []);

  const register = useCallback(async (username, email, password, displayName) => {
    const result = await authApi.register({ username, email, password, displayName });
    // result.data is the AuthResponse object (token, refreshToken, userId, username, email, etc.)
    const authData = result.data;
    const { token: newToken, refreshToken: newRefresh, ...userData } = authData;

    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefresh);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setRefreshTokenState(newRefresh);
    setUser(userData);

    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setRefreshTokenState(null);
    setUser(null);
    // Navigation handled by ProtectedRoute detecting isAuthenticated = false
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!storedRefresh) {
      throw new Error("No refresh token available");
    }

    const result = await authApi.refresh({ refreshToken: storedRefresh });
    const { token: newToken, refreshToken: newRefresh } = result.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefresh);

    setToken(newToken);
    setRefreshTokenState(newRefresh);

    return newToken;
  }, []);

    const updateUser = useCallback((newData) => {
      setUser((prev) => {
        const updated = { ...prev, ...newData };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    }, []);

    const value = useMemo(
      () => ({
        user,
        token,
        refreshToken: refreshTokenState,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
        updateUser,
      }),
      [user, token, refreshTokenState, isAuthenticated, isLoading, login, register, logout, refreshAccessToken, updateUser]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and methods.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
