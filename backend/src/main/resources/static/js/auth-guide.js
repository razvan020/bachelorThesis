/**
 * Authentication Guide for Frontend Developers
 * 
 * This file provides examples of how to use the JWT and OAuth2 authentication in the frontend.
 * 
 * 1. Login with JWT
 * 
 * To login with JWT, send a POST request to /api/login with the username and password.
 * The response will contain a JWT token and a refresh token.
 * 
 * Example:
 */

// Login function
async function login(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage or secure cookie
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('username', data.username);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * 2. Signup with JWT
 * 
 * To signup, send a POST request to /api/signup with the user details.
 * The response will contain a JWT token and a refresh token.
 * 
 * Example:
 */

// Signup function
async function signup(email, password, fullname) {
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        fullname: fullname,
      }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage or secure cookie
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('username', data.username);
    
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * 3. Making authenticated requests
 * 
 * To make authenticated requests, include the JWT token in the Authorization header.
 * 
 * Example:
 */

// Authenticated request function
async function fetchAuthenticatedData(url) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      return fetchAuthenticatedData(url);
    }

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * 4. Refreshing the token
 * 
 * If the JWT token expires, you can refresh it using the refresh token.
 * 
 * Example:
 */

// Refresh token function
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await fetch('/api/token/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      // If refresh fails, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update token in localStorage
    localStorage.setItem('token', data.accessToken);
    
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * 5. OAuth2 Login
 * 
 * To login with OAuth2, redirect the user to the OAuth2 provider's login page.
 * After successful authentication, the user will be redirected back to your application
 * with the JWT token and refresh token as query parameters.
 * 
 * Example:
 */

// Redirect to Google login
function loginWithGoogle() {
  window.location.href = '/oauth2/authorization/google';
}

// Redirect to Facebook login
function loginWithFacebook() {
  window.location.href = '/oauth2/authorization/facebook';
}

// Handle OAuth2 redirect
function handleOAuth2Redirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refreshToken');
  
  if (token && refreshToken) {
    // Store tokens in localStorage or secure cookie
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Remove tokens from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Redirect to home page or dashboard
    window.location.href = '/';
  }
}

// Call this function when your application loads
document.addEventListener('DOMContentLoaded', handleOAuth2Redirect);

/**
 * 6. Logout
 * 
 * To logout, remove the tokens from localStorage and redirect to the login page.
 * 
 * Example:
 */

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('username');
  
  // Redirect to login page
  window.location.href = '/login';
}