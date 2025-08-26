"use client";

import { AuthProvider } from "@/components/admin/AuthProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <main className="flex flex-1 flex-col">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <h1 className="text-lg font-semibold">Admin Panel</h1>
              </header>
              <div className="flex flex-1 flex-col p-4 bg-background">
                {children}
              </div>
            </main>
          </SidebarProvider>
          <Toaster position="top-right" />
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  );
}
