import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  
  CreditCard,
  Layers,
  // Globe,
  Lock,
  Phone,
  Award,
  Package,

  Bell,
  RectangleVertical,
  RemoveFormattingIcon,
  RulerDimensionLine,
  ChartNoAxesGantt,
} from "lucide-react";
import { FiMenu, FiChevronLeft, FiX } from "react-icons/fi";
import { GiCarousel, GiDeliveryDrone } from "react-icons/gi";

interface MenuItem {
  label: string;
  icon: ReactNode;
  href: string;
}

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const [user, setUser] = useState<{ username?: string; email?: string; role?: string } | null>(null);
  const [notificationsCount, setNotificationsCount] = useState(0); // live unread count

  const navigate = useNavigate();

  const toggleDesktopSidebar = () => setIsExpanded(!isExpanded);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleItemClick = (label: string, href: string) => {
    setActiveItem(label);
    if (window.innerWidth < 768) setIsMobileOpen(false);
    navigate(href);
  };

  // Load user from localStorage safely
  useEffect(() => {
    const loadUserFromStorage = () => {
      const stored = localStorage.getItem("superadmin");
      if (stored) {
        try {
          const sa = JSON.parse(stored);
          setUser({
            username: sa.username || "Unknown",
            email: sa.email || "Unknown",
            role: sa.role || "Role",
          });
        } catch (e) {
          console.error("Failed to parse superadmin from localStorage", e);
        }
      }
    };

    loadUserFromStorage();
    const handleStorageChange = () => loadUserFromStorage();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔴 Listen for real-time notification updates
  useEffect(() => {
    const updateNotificationsCount = () => {
      const savedNotifications = localStorage.getItem("notifications");
      if (savedNotifications) {
        const allNotifications = JSON.parse(savedNotifications) as { read?: boolean }[];
        const unreadCount = allNotifications.filter((n) => !n.read).length;
        setNotificationsCount(unreadCount);
      } else {
        setNotificationsCount(0);
      }
    };

    // Listen for custom "notificationsUpdated" event
    window.addEventListener("notificationsUpdated", updateNotificationsCount);

    // Run once on mount
    updateNotificationsCount();

    return () => {
      window.removeEventListener("notificationsUpdated", updateNotificationsCount);
    };
  }, []);

  const menuItems: MenuItem[] = [
    { label: "Users", icon: <User size={20} />, href: "/users" },
    { label: "Carousel", icon: <GiCarousel size={20} />, href: "/carousel" },
    { label: "Success Stories", icon: <Award size={20} />, href: "/success" },
    // { label: "Language", icon: <Globe size={20} />, href: "/language" },
    { label: "Freeze", icon: <Lock size={20} />, href: "/freeze" },
    { label: "Contact Us", icon: <Phone size={20} />, href: "/contact" },
    { label: "Subscription", icon: <CreditCard size={20} />, href: "/subscription" },
    { label: "Rewards", icon: <Award size={20} />, href: "/rewards" },
     {label:"Category Master", icon:<ChartNoAxesGantt size={20}/>,href:"/category"},
    { label: "Restaurant", icon: <Layers size={20} />, href: "/restarunt" },
     { label: "Orders", icon: <User size={20} />, href: "/orders" },
    {label:"Expenses",icon:<RectangleVertical size={20}/>, href:"/expenses"},
    {label:"Revenue",icon:<RemoveFormattingIcon size={20}/>,href:"/revenue"},
    { label: "Product", icon: <Package size={20} />, href: "/product" },
    { label: "Delivery Partner", icon: <GiDeliveryDrone size={20} />, href: "/delivery" },
    
    { label: "Settings", icon: <Settings size={20} />, href: "/settings" },
    { label: "Notifications", icon: <Bell size={20} />, href: "/notifications" },
    {label:"Policies",icon:<RulerDimensionLine size={20}/>, href:"/policies"}
  ];

  return (
    <div className="flex">
      <div
        className={`
          flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 text-white
          transition-all duration-300 sticky top-0 z-30
          ${isExpanded ? "w-64" : "w-20"} h-screen
          max-md:fixed max-md:top-0 max-md:left-0 max-md:transform max-md:transition-transform max-md:duration-300
          ${isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"} max-md:w-64
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between  border-b border-gray-700">
          {isExpanded && (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src="/Group2.png" alt="Logo" className="h-10 w-auto object-contain" />
              <span className="text-white font-bold text-lg truncate">Dashboard</span>
            </div>
          )}

          <div className="flex items-center">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none md:hidden"
            >
              <FiX size={20} />
            </button>
            <button
              onClick={toggleDesktopSidebar}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none max-md:hidden"
            >
              {isExpanded ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
       <nav className="flex flex-col flex-1 overflow-y-auto">
  {menuItems.map((item) => {
    const isNotifications = item.label === "Notifications";
    return (
      <button
        key={item.label}
        onClick={() => handleItemClick(item.label, item.href)}
        className={`
          flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-150 w-full text-left
          ${activeItem === item.label
            ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
            : "hover:bg-gray-700 hover:translate-x-0.5"}
        `}
      >
        <div className="relative flex-shrink-0">
          {item.icon}
          {isNotifications && notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {notificationsCount}
            </span>
          )}
        </div>
        {(isExpanded || window.innerWidth < 768) && (
          <span
            className={`font-medium truncate ${
              activeItem === item.label ? "text-white" : "text-gray-200"
            }`}
          >
            {item.label}
          </span>
        )}
      </button>
    );
  })}
</nav>


        {/* User Section */}
        {(isExpanded || window.innerWidth < 768) && user && (
          <div className="mt-auto pt-4 border-t border-gray-700 p-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white truncate">
                {user.username?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </div>
            <div className="flex flex-col truncate">
              <p className="text-sm font-medium truncate">
                {user.username || user.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
