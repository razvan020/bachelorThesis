// hooks/useOAuthTokenHandler.js - SESSION-BASED VERSION
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const useOAuthTokenHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthLogin } = useAuth();

  useEffect(() => {
    const handleOAuthComplete = async () => {
      const oauthParam = searchParams.get("oauth");

      if (oauthParam === "success") {
        try {
          console.log(
            "OAuth success detected, retrieving tokens from session..."
          );

          // Make request to get tokens from session
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/api/oauth/complete`,
            {
              method: "POST",
              credentials: "include", // Important: include session cookies
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to retrieve OAuth tokens from session");
          }

          const data = await response.json();

          // Use the tokens with your existing handleOAuthLogin
          await handleOAuthLogin(data.token, data.refreshToken);

          // Clean up the URL
          const url = new URL(window.location.href);
          url.search = "";
          window.history.replaceState({}, "", url.pathname);

          console.log(
            "OAuth login successful, session tokens processed and URL cleaned"
          );
        } catch (error) {
          console.error("OAuth session login failed:", error);

          // Clean up URL even on failure
          const url = new URL(window.location.href);
          url.search = "";
          window.history.replaceState({}, "", url.pathname);

          // Optionally redirect to login with error
          // router.push('/login?error=oauth_failed');
        }
      }
    };

    handleOAuthComplete();
  }, [searchParams, handleOAuthLogin, router]);
};

// Alternative: Direct implementation without hook
export const handleOAuthFromSession = async (handleOAuthLogin) => {
  const urlParams = new URLSearchParams(window.location.search);
  const oauthParam = urlParams.get("oauth");

  if (oauthParam === "success") {
    try {
      // Fetch tokens from session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL_GOOGLE}/api/oauth/complete`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve OAuth tokens");
      }

      const data = await response.json();
      await handleOAuthLogin(data.token, data.refreshToken);

      // Clean URL
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);

      return true;
    } catch (error) {
      console.error("OAuth login failed:", error);

      // Clean URL
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);

      return false;
    }
  }

  return null;
};
