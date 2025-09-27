// pages/Dashboard.tsx
import { useUsers } from "../../hooks/user";
import { useGetAllRewards } from "../../hooks/useReward";
import { useGetOrders } from "../../hooks/useorder";
import { useGetSubscriptions } from "../../hooks/useSubscription";
import { useProducts } from "../../hooks/useProduct";
import { useRestaurants } from "../../hooks/useRestarunt";
import { useGetFullCart } from "../../hooks/useCart";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export default function Dashboard() {
  const { users = [] } = useUsers();
  const { data: rewards = [], isLoading: rewardsLoading } = useGetAllRewards();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: subscriptions = [], isLoading: subsLoading } = useGetSubscriptions();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { data: cart = [], isLoading: cartLoading } = useGetFullCart();

  const loading =
    rewardsLoading || ordersLoading || subsLoading || productsLoading || restaurantsLoading || cartLoading;

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading dashboard...</p>;

  const currentYear = new Date().getFullYear();
  const pieColors = ["#34D399", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA", "#F472B6"];

  // Rewards by Type
  const rewardTypesData = [
    { name: "Percentage", value: rewards.filter((r) => r.type === "percentage").length },
    { name: "Fixed", value: rewards.filter((r) => r.type === "fixed").length },
    { name: "Points", value: rewards.filter((r) => r.type === "points").length },
  ];

  // Orders by Month
  const ordersByMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    orders: orders.filter((o) => new Date(o.createdAt).getMonth() === i && new Date(o.createdAt).getFullYear() === currentYear).length,
  }));

  // Products by Category
  const productsByCategory = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category || "Other"] = (acc[p.category || "Other"] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Users by Month
  const usersByMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    users: users.filter((u) => u.createdAt && new Date(u.createdAt).getMonth() === i && new Date(u.createdAt).getFullYear() === currentYear).length,
  }));

  // Cart Items by Product
  const cartProductsData = products
    .map((p) => {
      const count = cart.reduce((acc, c) => {
        return acc + c.items.filter((i) => i.product._id === p._id).length;
      }, 0);
      return { name: p.name, value: count };
    })
    .filter((p) => p.value > 0);

  // Subscriptions by Status or Type (example: active/inactive)
const subscriptionTypesData = Object.entries(
  subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.planType] = (acc[s.planType] || 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));


  // Restaurants by Category
 const restaurantCategoriesData = Object.entries(
  restaurants.reduce<Record<string, number>>((acc, r) => {
    const city = r.address || "Other"; // Use city instead of category
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));


  return (
    <div className="bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">SuperAdmin Dashboard</h1>

      <div className="grid grid-cols-4 lg:grid-cols-2 gap-6">
        {/* Rewards Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Rewards by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rewardTypesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {rewardTypesData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Month */}
        <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Orders by Month</h3>
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

        {/* Products by Category */}
        <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Products by Category</h3>
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

        {/* Users by Month */}
        <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Users by Month Joined</h3>
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

        {/* Cart Items Pie */}
        {cartProductsData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Cart Items by Product</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cartProductsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {cartProductsData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subscriptions Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Subscriptions by Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={subscriptionTypesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {subscriptionTypesData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Restaurants by Category */}
        <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[28rem]">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Restaurants by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={restaurantCategoriesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#F87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
