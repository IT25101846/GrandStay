import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // corrupted stored user — remove and continue
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({ email: authData.email, name: authData.name, role: authData.role }));
    setToken(authData.token);
    setUser({ email: authData.email, name: authData.name, role: authData.role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (authData) => {
    if (authData.token) {
      localStorage.setItem('token', authData.token);
      setToken(authData.token);
    }
    const updated = {
      email: authData.email || (user ? user.email : ''),
      name: authData.name || (user ? user.name : ''),
      role: authData.role || (user ? user.role : '')
    };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
