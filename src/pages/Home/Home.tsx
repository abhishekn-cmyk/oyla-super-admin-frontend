// pages/Home.tsx
import { useUsers } from "../../hooks/user";
import { useGetAllRewards } from "../../hooks/useReward";
import { useGetOrders } from "../../hooks/useorder";
import { useGetSubscriptions } from "../../hooks/useSubscription";
import { useProducts } from "../../hooks/useProduct";
import { useRestaurants } from "../../hooks/useRestarunt";
import { useGetFullCart } from "../../hooks/useCart";
import { FiUsers, FiGift, FiShoppingCart, FiPackage, FiBox, FiCoffee } from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
export default function Home() {
    const navigate = useNavigate();
  // Fetch data
  const { users = [] } = useUsers();
  const { data: rewards = [], isLoading: rewardsLoading } = useGetAllRewards();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: subscriptions = [], isLoading: subsLoading } = useGetSubscriptions();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { data: cart = [], isLoading: cartLoading } = useGetFullCart();

  const loading = rewardsLoading || ordersLoading || subsLoading || productsLoading || restaurantsLoading || cartLoading;
  if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;

  // Stats cards
  const stats = [
  { title: "Users", value: users.length, icon: <FiUsers className="w-6 h-6 text-white" />, color: "bg-blue-500", link: "/users" },
  { title: "Rewards", value: rewards.length, icon: <FiGift className="w-6 h-6 text-white" />, color: "bg-green-500", link: "/rewards" },
  { title: "Orders", value: orders.length, icon: <FiShoppingCart className="w-6 h-6 text-white" />, color: "bg-yellow-500", link: "/orders" },
  { title: "Subscriptions", value: subscriptions.length, icon: <FiPackage className="w-6 h-6 text-white" />, color: "bg-purple-500", link: "/subscription" },
  { title: "Products", value: products.length, icon: <FiBox className="w-6 h-6 text-white" />, color: "bg-pink-500", link: "/product" },
  { title: "Restaurants", value: restaurants.length, icon: <FiCoffee className="w-6 h-6 text-white" />, color: "bg-red-500", link: "/restarunt" },
  { title: "Cart Items", value: cart.length, icon: <FiShoppingCart className="w-6 h-6 text-white" />, color: "bg-indigo-500", link: "/cart" },
];

  // Pie chart: Rewards by Type
  const rewardTypesData = [
    { name: "Percentage", value: rewards.filter(r => r.type === "percentage").length },
    { name: "Fixed", value: rewards.filter(r => r.type === "fixed").length },
    { name: "Points", value: rewards.filter(r => r.type === "points").length },
  ];
  const pieColors = ["#34D399", "#60A5FA", "#FBBF24"];

  // Bar chart: Orders by Month
  const currentYear = new Date().getFullYear();
  const ordersByMonth = Array.from({ length: 12 }, (_, i) => {
    const monthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getMonth() === i && date.getFullYear() === currentYear;
    }).length;
    return { month: new Date(0, i).toLocaleString("default", { month: "short" }), orders: monthOrders };
  });

  // Bar chart: Products by Category (example)
  const productCategoriesData = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category || "Other"] = (acc[p.category || "Other"] || 0) + 1;
    return acc;
  }, {});
  const productsByCategory = Object.entries(productCategoriesData).map(([name, value]) => ({ name, value }));

  // Bar chart: Users by Month Joined
  const usersByMonth = Array.from({ length: 12 }, (_, i) => {
  const monthUsers = users.filter(u => {
    if (!u.createdAt) return false; // skip if no createdAt
    const date = new Date(u.createdAt);
    return date.getMonth() === i && date.getFullYear() === currentYear;
  }).length;

  return {
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    users: monthUsers,
  };
});

  return (
    <div className="bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">SuperAdmin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.title} className="flex items-center p-4 bg-white shadow rounded-lg border"  onClick={() => navigate(stat.link)} >
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Pie Chart: Rewards by Type */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="text-lg font-semibold mb-4">Rewards by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rewardTypesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {rewardTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]}/> 
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Orders by Month */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="text-lg font-semibold mb-4">Orders by Month</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Products by Category */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productsByCategory}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Users by Month Joined */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="text-lg font-semibold mb-4">Users by Month Joined</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
