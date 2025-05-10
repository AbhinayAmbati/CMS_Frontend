import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from cookies on initial load
    const storedUser = Cookies.get('currentUser');
    const storedToken = Cookies.get('token');
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Login function that will be used by the Login component
  const login = (token, user) => {
    // Store in cookies
    Cookies.set('token', token);
    Cookies.set('currentUser', JSON.stringify(user));
    
    // Update state
    setToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    // Remove from cookies
    Cookies.remove('token');
    Cookies.remove('currentUser');
    
    // Update state
    setToken(null);
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser?.admin === true;
  };

  // Provide all necessary values to the context
  const value = {
    currentUser,
    token,
    login,
    logout,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};