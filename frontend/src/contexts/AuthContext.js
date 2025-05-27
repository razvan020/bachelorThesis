// contexts/AuthContext.js - FIXED VERSION
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
  showLoginDropdown: false,
  loginDropdownMessage: "",
  login: async (username, password, recaptchaToken) => {},
  handleOAuthLogin: async (token, refreshToken) => {},
  logout: async () => {},
  fetchCartCount: async () => {},
  showLoginWithMessage: (message) => {},
  hideLogin: () => {},
});

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  // state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [loginDropdownMessage, setLoginDropdownMessage] = useState("");

  // Always fetch relative to the Next.js server on :3000
  const api = (path) => path;

  // ——— LOGIN ———
  const login = useCallback(
    async (username, password, recaptchaToken) => {
      const res = await fetch(api("/api/login"), {
        method: "POST",
        credentials: "include", // cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, recaptchaToken }),
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
    try {
      console.log("Processing OAuth tokens...", {
        tokenLength: token?.length,
        refreshTokenLength: refreshToken?.length,
      });

      // Validate tokens before storing
      if (!token || !refreshToken || token.split(".").length !== 3) {
        throw new Error("Invalid OAuth tokens received");
      }

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
        const errorText = await res.text();
        console.error("Failed to get user data:", errorText);
        throw new Error(
          "Failed to get user data after OAuth login: " + errorText
        );
      }

      const userData = await res.json();
      console.log("OAuth user data received:", userData);

      localStorage.setItem("username", userData.username);

      setUser(userData);
      setIsAuthenticated(true);

      // fetch cart now that we're authenticated
      await fetchCartCount();
      return userData;
    } catch (error) {
      console.error("OAuth login error:", error);
      // Clean up any stored tokens on error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      throw error;
    }
  }, []);

  // ——— LOGOUT ———
  const logout = useCallback(async () => {
    try {
      await fetch(api("/api/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear client state, even if server call fails
      setUser(null);
      setIsAuthenticated(false);
      setCartItemCount(0);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      router.push("/");
    }
  }, [router]);

  // ——— FETCH CART COUNT ———
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setCartItemCount(0);
      return;
    }

    try {
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
            return;
          }
          // Retry with new token
          const newToken = localStorage.getItem("token");
          const retryRes = await fetch(api("/api/cart"), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });

          if (retryRes.ok) {
            const data = await retryRes.json();
            setCartItemCount(data.totalQuantity || 0);
            return;
          }
        }
        setCartItemCount(0);
        return;
      }

      const data = await res.json();
      setCartItemCount(data.totalQuantity || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartItemCount(0);
    }
  }, [isAuthenticated]);

  // ——— REFRESH TOKEN ———
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) return false;

    try {
      const res = await fetch(api("/api/token/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
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

        // Validate token format
        if (token.split(".").length !== 3) {
          console.error("Invalid token format, clearing localStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("username");
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
          if (refreshed) {
            // Retry with new token
            const newToken = localStorage.getItem("token");
            const retryRes = await fetch(api("/api/user/me"), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });

            if (retryRes.ok) {
              const userData = await retryRes.json();
              setUser(userData);
              setIsAuthenticated(true);
              localStorage.setItem("username", userData.username);
            } else {
              // Clear everything if retry fails
              setUser(null);
              setIsAuthenticated(false);
              setCartItemCount(0);
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("username");
            }
          } else {
            // Clear everything if refresh fails
            setUser(null);
            setIsAuthenticated(false);
            setCartItemCount(0);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");
          }
        } else {
          // Clear everything for other errors
          setUser(null);
          setIsAuthenticated(false);
          setCartItemCount(0);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("username");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
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

  // ——— SHOW LOGIN DROPDOWN WITH MESSAGE ———
  const showLoginWithMessage = useCallback((message) => {
    setLoginDropdownMessage(
      message || "You need to be logged in to access that"
    );
    setShowLoginDropdown(true);
  }, []);

  // ——— HIDE LOGIN DROPDOWN ———
  const hideLogin = useCallback(() => {
    setShowLoginDropdown(false);
    setLoginDropdownMessage("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        cartItemCount,
        showLoginDropdown,
        loginDropdownMessage,
        login,
        handleOAuthLogin,
        logout,
        fetchCartCount,
        showLoginWithMessage,
        hideLogin,
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
