// contexts/AuthContext.js
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  cartItemCount: 0,
  login: async (username, password) => {},
  handleOAuthLogin: async (token, refreshToken) => {}, // New method
  logout: async () => {},
  fetchCartCount: async () => {},
});

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  // state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Always fetch relative to the Next.js server on :3000
  const api = (path) => path;

  // ——— LOGIN ———
  const login = useCallback(
    async (username, password) => {
      const res = await fetch(api("/api/login"), {
        method: "POST",
        credentials: "include", // cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error("Login failed: " + err);
      }

      const userData = await res.json();

      // Store tokens in localStorage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("username", userData.username);

      setUser(userData);
      setIsAuthenticated(true);

      // fetch cart now that we're authenticated
      await fetchCartCount();
      router.push("/");
    },
    [router]
  );

  // ——— HANDLE OAUTH LOGIN ———
  const handleOAuthLogin = useCallback(async (token, refreshToken) => {
    // Store tokens in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);

    // Fetch user data with the token
    const res = await fetch(api("/api/user/me"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to get user data after OAuth login");
    }

    const userData = await res.json();
    localStorage.setItem("username", userData.username);

    setUser(userData);
    setIsAuthenticated(true);

    // fetch cart now that we're authenticated
    await fetchCartCount();
    return userData;
  }, []);

  // ——— LOGOUT ———
  const logout = useCallback(async () => {
    await fetch(api("/api/logout"), {
      method: "POST",
      credentials: "include",
    });

    // clear client state
    setUser(null);
    setIsAuthenticated(false);
    setCartItemCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    router.push("/login");
  }, [router]);

  // ——— FETCH CART COUNT ———
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(api("/api/cart"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Try to refresh the token
        const refreshed = await refreshToken();
        if (!refreshed) {
          await logout();
        }
      }
      setCartItemCount(0);
      return;
    }

    const data = await res.json();
    setCartItemCount(data.totalQuantity || 0);
  }, [isAuthenticated, logout]);

  // ——— REFRESH TOKEN ———
  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const res = await fetch(api("/api/token/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  // ——— VERIFY SESSION ON MOUNT ———
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setCartItemCount(0);
          setLoading(false);
          return;
        }

        const res = await fetch(api("/api/user/me"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem("username", userData.username);
        } else if (res.status === 401) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (!refreshed) {
            setUser(null);
            setIsAuthenticated(false);
            setCartItemCount(0);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setCartItemCount(0);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("username");
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        setCartItemCount(0);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshToken]);

  // ——— WHEN AUTH CHANGES, UPDATE CART ———
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, fetchCartCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        cartItemCount,
        login,
        handleOAuthLogin, // New method
        logout,
        fetchCartCount,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
