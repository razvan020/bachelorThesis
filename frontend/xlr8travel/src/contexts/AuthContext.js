"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react"; // Added useCallback
import { useRouter } from "next/navigation";

// Define the initial context value structure
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  cartItemCount: 0,
  login: (userData) => {}, // Placeholder function
  logout: async () => {}, // Placeholder async function
  fetchCartCount: async () => {}, // Placeholder async function
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  // Define fetchCartCount with useCallback
  const fetchCartCount = useCallback(async () => {
    // Only fetch if authenticated (using current state)
    // Note: Checking localStorage here might be stale if logout happened without refresh
    if (!isAuthenticated || !user) {
      console.log(
        "fetchCartCount: User not authenticated, setting count to 0."
      );
      setCartItemCount(0);
      return;
    }
    console.log("fetchCartCount: Attempting to fetch cart count...");
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/cart`, {
        method: "GET",
        credentials: "include", // *** CRUCIAL ***
      });

      if (!response.ok) {
        console.error(
          `WorkspaceCartCount: HTTP error! status: ${response.status}`
        );
        try {
          const errData = await response.json();
          console.error("fetchCartCount: Error data:", errData);
        } catch (e) {}
        setCartItemCount(0);
        // Maybe handle 401 Unauthorized by logging out?
        if (response.status === 401) {
          console.warn("fetchCartCount received 401, logging out.");
          logout(); // Call the logout defined below
        }
        return;
      }

      const data = await response.json();
      // Assuming backend returns { items: [], totalPrice: 0.0, totalQuantity: 0 }
      const count = data.totalQuantity || 0; // Use totalQuantity from CartDTO
      setCartItemCount(count);
      console.log("fetchCartCount: Cart count updated:", count);
    } catch (error) {
      console.error("fetchCartCount: Error fetching cart count:", error);
      setCartItemCount(0); // Reset on network error
    }
    // Include 'isAuthenticated' and 'user' in dependencies so it refetches if auth state changes externally
  }, [isAuthenticated, user]); // Removed 'logout' which was incorrect dependency

  // Initial load check
  useEffect(() => {
    setLoading(true);
    const storedUsername = localStorage.getItem("username"); // Simple check for demo
    // In production: Validate stored token/session with backend here
    if (storedUsername) {
      console.log(
        "AuthProvider Mount: Found stored username, setting initial state."
      );
      setUser({ username: storedUsername });
      setIsAuthenticated(true);
      // fetchCartCount(); // Fetch will be triggered by state change below if needed
    } else {
      console.log("AuthProvider Mount: No stored username found.");
      setUser(null);
      setIsAuthenticated(false);
      setCartItemCount(0);
    }
    setLoading(false);
  }, []); // Run only once on mount

  // Fetch cart count whenever authentication status changes to true
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "AuthProvider: isAuthenticated changed to true, fetching cart count."
      );
      fetchCartCount();
    } else {
      // Ensure cart count is zeroed out if user becomes unauthenticated
      setCartItemCount(0);
    }
  }, [isAuthenticated, fetchCartCount]);

  const login = useCallback(
    (userData) => {
      console.log("AuthContext login called with:", userData);
      if (!userData || !userData.username) {
        console.error(
          "AuthContext: login function called without valid userData"
        );
        return;
      }
      localStorage.setItem("username", userData.username); // Persist before setting state
      // if (userData.token) localStorage.setItem('authToken', userData.token);
      setUser(userData); // Set user state
      setIsAuthenticated(true); // Set authenticated state (triggers useEffect above)
      console.log("AuthContext: State updated after login.");
      // fetchCartCount() will be called by the useEffect watching isAuthenticated
      router.push("/"); // Redirect after login attempt
    },
    [router]
  ); // Removed fetchCartCount dependency

  const logout = useCallback(async () => {
    console.log("AuthContext logout called");
    // Optional: Call backend logout endpoint first
    // await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    setUser(null); // Set user state to null
    setIsAuthenticated(false); // Set authenticated state to false (triggers useEffect above)
    // setCartItemCount(0); // Handled by useEffect watching isAuthenticated
    console.log("AuthContext: State cleared after logout.");
    router.push("/login");
    // Added router dependency
  }, [router]);

  // Value provided by the context includes fetchCartCount now
  const value = {
    user,
    isAuthenticated,
    loading,
    cartItemCount,
    login,
    logout,
    fetchCartCount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
