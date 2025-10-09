// pages/Home.tsx
import { useUsers } from "../../hooks/user";
import { useGetAllRewards } from "../../hooks/useReward";
import { useGetOrders } from "../../hooks/useorder";
import { useProducts } from "../../hooks/useProduct";
import { useRestaurants } from "../../hooks/useRestarunt";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiGift, FiShoppingCart, FiPackage, FiBox, FiCoffee } from "react-icons/fi";
import  { useGetSubscriptions } from "../../hooks/useSubscription";

export default function Home() {
  const navigate = useNavigate();

  // Fetch data
  const { users = [] } = useUsers();
  const { data: rewards = [], isLoading: rewardsLoading } = useGetAllRewards();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const {data:subs=[]}=useGetSubscriptions();

  const loading = rewardsLoading || ordersLoading || productsLoading || restaurantsLoading;
  if (loading) return <p className="p-6 text-center text-gray-600">Loading dashboard...</p>;

  // Stats cards
  const stats = [
    { title: "Users", value: users.length, icon: <FiUsers className="w-6 h-6 text-white" />, color: "bg-blue-500", link: "/users" },
    { title: "Rewards", value: rewards.length, icon: <FiGift className="w-6 h-6 text-white" />, color: "bg-green-500", link: "/rewards" },
    { title: "Orders", value: orders.length, icon: <FiShoppingCart className="w-6 h-6 text-white" />, color: "bg-yellow-500", link: "/orders" },
    { title: "Products", value: products.length, icon: <FiBox className="w-6 h-6 text-white" />, color: "bg-pink-500", link: "/product" },
    { title: "Restaurants", value: restaurants.length, icon: <FiCoffee className="w-6 h-6 text-white" />, color: "bg-red-500", link: "/restarunt" },
    { title: "Subscriptions", value: subs.length, icon: <FiPackage className="w-6 h-6 text-white" />, color: "bg-purple-500", link: "/subscription" },
  ];

  return (
    <div className="bg-gray-50 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">SuperAdmin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div
            key={stat.title}
            onClick={() => navigate(stat.link)}
            className={`flex items-center p-5 bg-white shadow-lg rounded-xl border transition transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer`}
          >
            <div className={`flex items-center justify-center w-14 h-14 rounded-full ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
