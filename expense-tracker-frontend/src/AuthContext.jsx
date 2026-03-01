import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);

const login = (userData) => {
  setUser(userData);
  localStorage.setItem("user", JSON.stringify(userData));  // ← keep in sync
};

const logout = () => {
  setUser(null);
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
};
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);