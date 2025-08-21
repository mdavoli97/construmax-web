"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = "admin_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      // Verificar si el token es válido (en este caso, simplemente verificamos si existe)
      try {
        const tokenData = JSON.parse(atob(token));
        const now = Date.now();

        // Token válido por 24 horas
        if (tokenData.exp > now) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch (error) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
