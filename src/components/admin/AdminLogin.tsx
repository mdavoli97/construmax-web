"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function AdminLogin() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(formData.username, formData.password);
      if (!success) {
        setError("Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al escribir
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">🏗️</div>
            <span className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">
              ConstruMax
            </span>
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Panel de Administración
        </h2>
        <p className="mt-2 text-center text-sm text-gray-800">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-sm sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg sm:rounded-lg">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-base sm:text-sm text-gray-900"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-base sm:text-sm text-gray-900"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
                </span>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
