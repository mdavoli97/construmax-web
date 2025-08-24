"use client";

import { AuthProvider } from "@/components/admin/AuthProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50">
            <div className="flex h-screen">
              <AdminSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
          <Toaster position="top-right" />
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  );
}
