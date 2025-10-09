import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { type NotificationType } from "../../types/notification";
import { useNotifications } from "../../hooks/useNotification";

const socket = io(`${import.meta.env.VITE_API_URL}`);

type Tab =  "cart" | "order";

export default function Notifications() {
  const { data, isLoading, error, refetch } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("cart");
  const [counts, setCounts] = useState<{  cart: number; order: number }>({
    
    cart: 0,
    order: 0,
  });

  // Load notifications from localStorage first, then merge with API data
  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const storedNotifications: NotificationType[] = JSON.parse(stored);
      if (data) {
        const merged = data.notifications.map(n => {
          const storedItem = storedNotifications.find(s => s._id === n._id);
          return storedItem ? { ...n, read: storedItem.read } : n;
        });
        setNotifications(merged);
      } else {
        setNotifications(storedNotifications);
      }
    } else if (data) {
      setNotifications(data.notifications);
    } else {
      refetch();
    }
  }, [data, refetch]);

  // Recalculate counts whenever notifications change
  useEffect(() => {
    const newCounts: {  cart: number; order: number } = {
      
      cart: 0,
      order: 0,
    };

    notifications.forEach(n => {
      if (!n.read) {
        const key = n.type as keyof typeof newCounts;
        newCounts[key] += 1;
      }
    });

    setCounts(newCounts);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
  }, [notifications]);

  // Join superadmin room
  useEffect(() => {
    const storedAdmin = localStorage.getItem("superadmin");
    if (!storedAdmin) return;

    try {
      const userObj = JSON.parse(storedAdmin);
      const userId = userObj._id;
      if (userId) socket.emit("join", userId);
    } catch (err) {
      console.error("Failed to parse superadmin from localStorage", err);
    }
  }, []);

  // Real-time notifications
  useEffect(() => {
    const handleNew = (newNotification: NotificationType) => {
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleRead = ({ notificationId }: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
      );
    };

    socket.on("new-notification", handleNew);
    socket.on("notificationRead", handleRead);

    return () => {
      socket.off("new-notification", handleNew);
      socket.off("notificationRead", handleRead);
    };
  }, []);

  const markReadAPI = async (notificationId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notification/read/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to mark read");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
    );
    await markReadAPI(notificationId);
    socket.emit("notificationRead", { notificationId });
  };

  const handleMarkAllRead = async () => {
    const activeNotifications = notifications.filter(n => n.type === activeTab && !n.read);
    setNotifications(prev =>
      prev.map(n => (n.type === activeTab ? { ...n, read: true } : n))
    );
    await Promise.all(activeNotifications.map(n => markReadAPI(n._id)));
    activeNotifications.forEach(n => socket.emit("notificationRead", { notificationId: n._id }));
  };

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div>Error loading notifications</div>;

  const filteredNotifications = notifications.filter(n => n.type === activeTab);
  const totalUnread = notifications.filter(n => !n.read).length;
  const totalRead = notifications.filter(n => n.read).length;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex gap-4 font-semibold">
          {totalUnread > 0 && (
            <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full transition-all duration-300 ease-in-out transform scale-100">
              Unread: {totalUnread}
            </div>
          )}
          {totalRead > 0 && (
            <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full transition-all duration-300 ease-in-out transform scale-100">
              Read: {totalRead}
            </div>
          )}
          {notifications.length > 0 && (
            <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full transition-all duration-300 ease-in-out transform scale-100">
              Total: {notifications.length}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {(["cart", "order"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center
                transition-all duration-300 ease-in-out transform
                ${counts[tab] > 0 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No notifications in this category</div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n._id}
              onClick={() => handleMarkRead(n._id)}
              className={`cursor-pointer p-4 border rounded-lg transition flex flex-col hover:bg-gray-100 ${
                n.read ? "bg-gray-50" : "bg-white shadow-sm"
              }`}
            >
              <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                <span className="capitalize font-semibold">{n.type}</span>
              </div>
              <div className="font-medium text-gray-800">{n.title}</div>
              <div className="text-gray-700">{n.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
