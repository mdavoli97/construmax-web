"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Credenciales de administrador (en producción deberían estar en variables de entorno)
const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123",
};

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
    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Crear token simple (en producción usar JWT real)
      const tokenData = {
        username,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        role: "admin",
      };

      const token = btoa(JSON.stringify(tokenData));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setIsAuthenticated(true);
      return true;
    }

    return false;
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
