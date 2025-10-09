import { useQuery } from "@tanstack/react-query";
import type { NotificationsResponse } from "../types/notification";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { type NotificationType } from "../types/notification";
export const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const token = localStorage.getItem("token"); // get token from localStorage
  const res = await fetch(`${import.meta.env.VITE_API_URL}/notification/all`, {
 
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // add token if exists
    },
  });

  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 5000, // auto-refresh every 5s
  });
};




const socket = io(`${import.meta.env.VITE_API_URL}`);

export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize count from localStorage
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const allNotifications = JSON.parse(savedNotifications) as NotificationType[];
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    }

    const handleNew = (newNotification: NotificationType) => {
      setUnreadCount(prev => prev + 1);
    };

    const handleRead = ({ notificationId }: { notificationId: string }) => {
      setUnreadCount(prev => Math.max(prev - 1, 0));
    };

    socket.on("new-notification", handleNew);
    socket.on("notificationRead", handleRead);

    return () => {
      socket.off("new-notification", handleNew);
      socket.off("notificationRead", handleRead);
    };
  }, []);

  return unreadCount;
}
