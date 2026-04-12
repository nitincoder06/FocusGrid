"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationProps extends Notification {
  onDismiss: (id: string) => void;
}

const notificationConfig = {
  success: {
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    icon: CheckCircle2,
    color: "text-emerald-400",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertCircle,
    color: "text-destructive",
  },
  warning: {
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: AlertCircle,
    color: "text-amber-400",
  },
  info: {
    bg: "bg-chart-1/10",
    border: "border-chart-1/30",
    icon: Info,
    color: "text-chart-1",
  },
};

function NotificationItem({
  id,
  type,
  title,
  message,
  onDismiss,
}: NotificationProps) {
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: -20 }}
      className={`${config.bg} border ${config.border} rounded-lg p-4 backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.color} h-5 w-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`${config.color} font-semibold text-sm`}>{title}</p>
          {message && (
            <p className="text-muted-foreground text-sm mt-1">{message}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 flex-shrink-0 hover:bg-transparent"
          onClick={() => onDismiss(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Expose to window for easy access
  useEffect(() => {
    (window as any).notify = addNotification;
  }, [addNotification]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper hook for using notifications
export function useNotification() {
  return {
    success: (title: string, message?: string) => {
      (window as any).notify?.({
        type: "success",
        title,
        message,
      });
    },
    error: (title: string, message?: string) => {
      (window as any).notify?.({
        type: "error",
        title,
        message,
      });
    },
    info: (title: string, message?: string) => {
      (window as any).notify?.({
        type: "info",
        title,
        message,
      });
    },
    warning: (title: string, message?: string) => {
      (window as any).notify?.({
        type: "warning",
        title,
        message,
      });
    },
  };
}
