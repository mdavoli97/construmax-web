"use client";

import { useState } from "react";
import { AuthProvider } from "@/components/admin/AuthProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { Toaster } from "@/components/ui/sonner";
import { MenuIcon } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <div className="h-screen bg-gray-50 flex flex-col">
            {/* Mobile Header - Fixed */}
            <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h1>
              <button
                type="button"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="sr-only">Abrir menú</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Main layout */}
            <div className="flex flex-1 overflow-hidden">
              <AdminSidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />

              {/* Main content */}
              <div className="flex flex-col flex-1 lg:pl-64">
                <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <Toaster position="top-right" />
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  );
}
