import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context for authentication
const AuthContext = createContext();

// Custom hook to use AuthContext in other components
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthContext Provider to manage auth state
export const AuthProvider = ({ children }) => {
  // State to store user data, token, and role.
  // We initialize the state by reading from localStorage
  // for the initial render.
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  // Use useEffect to keep localStorage in sync with state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
    }
  }, [user, token, role]);

  // Login function to set user, token, and role
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setRole(userData.role);
  };

  // Logout function to clear user data
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
  };

  // Context value that will be accessible in any component that consumes it
  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};