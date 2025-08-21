"use client";

import { AuthProvider } from "@/components/admin/AuthProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-gray-800 hover:text-gray-900 text-sm"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Volver a la tienda
                  </Link>
                </div>
                <div className="text-sm text-gray-700">
                  Panel de Administración
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            <AdminSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
