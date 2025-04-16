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

  // In dev we hit Next.js; in prod we hit the real backend
  const BASE =
    process.env.NODE_ENV === "development"
      ? ""
      : process.env.NEXT_PUBLIC_BACKEND_URL;
  const api = (path) => `${BASE}${path}`;

  // ——— LOGIN ———
  const login = useCallback(
    async (username, password) => {
      const res = await fetch(api("/api/login"), {
        method: "POST",
        credentials: "include", // ← must for cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error("Login failed: " + err);
      }
      const userData = await res.json();
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("username", userData.username);
      // fetch cart now that we’re authenticated
      await fetchCartCount();
      router.push("/");
    },
    [router]
  );

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
    localStorage.removeItem("username");
    router.push("/login");
  }, [router]);

  // ——— FETCH CART COUNT ———
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }
    const res = await fetch(api("/api/cart"), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        await logout();
      }
      setCartItemCount(0);
      return;
    }
    const data = await res.json();
    setCartItemCount(data.totalQuantity || 0);
  }, [isAuthenticated, logout]);

  // ——— VERIFY SESSION ON MOUNT ———
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(api("/api/user/me"), {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem("username", userData.username);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setCartItemCount(0);
          localStorage.removeItem("username");
        }
      } catch (e) {
        setUser(null);
        setIsAuthenticated(false);
        setCartItemCount(0);
        localStorage.removeItem("username");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
