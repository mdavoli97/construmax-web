"use client";

import React, { createContext, useContext } from "react";
import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextType {
  addNotification: (
    type: NotificationType,
    title: string,
    message?: string
  ) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string
  ) => {
    const description = message || undefined;

    switch (type) {
      case "success":
        toast.success(title, { description });
        break;
      case "error":
        toast.error(title, { description });
        break;
      case "info":
        toast.info(title, { description });
        break;
      case "warning":
        toast.warning(title, { description });
        break;
      default:
        toast(title, { description });
    }
  };

  const success = (title: string, message?: string) => {
    toast.success(title, { description: message });
  };

  const error = (title: string, message?: string) => {
    toast.error(title, { description: message });
  };

  const info = (title: string, message?: string) => {
    toast.info(title, { description: message });
  };

  const warning = (title: string, message?: string) => {
    toast.warning(title, { description: message });
  };

  return (
    <NotificationContext.Provider
      value={{ addNotification, success, error, info, warning }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
