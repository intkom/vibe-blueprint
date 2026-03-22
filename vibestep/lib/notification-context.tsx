"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

export type Notification = {
  id: string;
  message: string;
  type: "success" | "info" | "milestone";
  icon?: string;
};

type NotificationContextValue = {
  notifications: Notification[];
  addNotification: (msg: string, type?: Notification["type"], icon?: string) => void;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  addNotification: () => {},
  dismiss: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const addNotification = useCallback((
    message: string,
    type: Notification["type"] = "success",
    icon?: string,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [{ id, message, type, icon }, ...prev].slice(0, 5));
    const t = setTimeout(() => dismiss(id), 4800);
    timers.current.set(id, t);
  }, [dismiss]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
