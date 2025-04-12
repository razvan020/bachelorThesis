"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Ensure useRouter is imported here

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Get router instance here

    useEffect(() => {
        setLoading(true); // Start loading
        // Example: Check localStorage (Replace with your actual token validation)
        const storedUsername = localStorage.getItem('username');
        console.log("AuthContext Initial Check - Stored Username:", storedUsername); // Debug Log
        if (storedUsername) {
            // !! In production, validate token with backend here before setting state !!
            const initialUserData = { username: storedUsername /* Add other relevant fields */ };
            setUser(initialUserData);
            setIsAuthenticated(true);
            console.log("AuthContext Initial State Set:", initialUserData); // Debug Log
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false); // Finish loading
    }, []);

    const login = (userData) => {
        console.log("AuthContext: Attempting login with data:", userData); // Debug Log
        if (!userData || !userData.username) {
             console.error("AuthContext: login function called without valid userData");
             return; // Prevent setting invalid state
        }
        setUser(userData);
        setIsAuthenticated(true);
        // Persist basic info if needed
        localStorage.setItem('username', userData.username);
        // if (userData.token) localStorage.setItem('authToken', userData.token); // If using JWT

        console.log("AuthContext: State updated.", { user: userData, isAuthenticated: true }); // Debug Log

        // --- Redirect AFTER state update ---
        console.log("AuthContext: Redirecting to /"); // Debug Log
        router.push('/'); // <-- Redirect moved here
    };

    const logout = async () => {
        console.log("AuthContext: Logging out..."); // Debug Log
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('username');
        localStorage.removeItem('authToken');
        // Optional: Call backend logout
        router.push('/login');
    };

    const value = { user, isAuthenticated, loading, login, logout };

    // Render children only after initial loading check is complete
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};