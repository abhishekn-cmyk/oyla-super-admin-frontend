import { useState, useMemo } from "react";
import { useRevenueReport, useDeliveryDelayReport } from "../../hooks/usereports";
import type { DeliveryDelay } from "../../api/reports";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Chart colors
const COLORS = ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

type UserAnalytics = {
  userId: string;
  username: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
};

type PartnerAnalytics = {
  partnerId: string;
  name: string;
  totalDeliveries: number;
  delayedDeliveries: number;
};

type PieDataItem = {
  name: string;
  value: number;
  percentage: number;
};

const TABS = ["revenue", "delays", "analytics", "userAnalytics", "deliveryPartnerAnalytics"] as const;

const ITEMS_PER_PAGE = 2;

export default function Revenue() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = TABS[activeTabIndex];

  // Pagination state
  const [page, setPage] = useState(1);

  // Fetch data
  const { data: revenueData, isLoading: revenueLoading, isError: revenueIsError, error: revenueError } =
    useRevenueReport();
  const { data: delayData, isLoading: delayLoading, isError: delayIsError, error: delayError } =
    useDeliveryDelayReport();

  const isLoading = revenueLoading || delayLoading;
  const isError = revenueIsError || delayIsError;
  const errorMessage = (revenueError || delayError as Error)?.message;

  // Revenue by User chart
  const chartData = useMemo(() => {
    return (revenueData?.subscriptions || []).map((sub) => ({
      name: sub.user?.email || "N/A",
      revenue: sub.subscriptionTotal || 0,
    }));
  }, [revenueData]);

  // Revenue by Plan Pie chart
  const pieDataWithPercent: PieDataItem[] = useMemo(() => {
    const pieData: { name: string; value: number }[] = (revenueData?.subscriptions || []).reduce(
      (acc, sub) => {
        const planName = sub.subscriptionDetails.plan || "N/A";
        const idx = acc.findIndex((p) => p.name === planName);
        if (idx > -1) acc[idx].value += sub.subscriptionTotal || 0;
        else acc.push({ name: planName, value: sub.subscriptionTotal || 0 });
        return acc;
      },
      [] as { name: string; value: number }[]
    );

    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

    return pieData.map((item) => ({
      ...item,
      percentage: totalValue ? (item.value / totalValue) * 100 : 0,
    }));
  }, [revenueData]);

  // User analytics
  const userAnalytics: UserAnalytics[] = useMemo(() => revenueData?.userAnalytics || [], [revenueData]);

  // Delivery Partner analytics
  const partnerAnalytics: PartnerAnalytics[] = useMemo(() => revenueData?.deliveryPartnerAnalytics || [], [
    revenueData,
  ]);

  // Pagination helpers
  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentPageItems = (items: any[]) =>
    items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePrevTab = () => {
    setActiveTabIndex((i) => (i - 1 + TABS.length) % TABS.length);
    setPage(1);
  };
  const handleNextTab = () => {
    setActiveTabIndex((i) => (i + 1) % TABS.length);
    setPage(1);
  };

  return (
    <div className=" bg-gray-50 p-2 sm:p-4 lg:p-8">
      {/* Header */}
    

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
  {/* Previous Button */}
  <button
    onClick={handlePrevTab}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Previous
  </button>

  {/* Tabs */}
  <div className="flex flex-wrap gap-2 justify-center flex-1">
    {TABS.map((tab, idx) => (
      <button
        key={tab}
        onClick={() => {
          setActiveTabIndex(idx);
          setPage(1);
        }}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
          activeTabIndex === idx
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
        }`}
      >
        {tab.split(/(?=[A-Z])/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </button>
    ))}
  </div>

  {/* Next Button */}
  <button
    onClick={handleNextTab}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
  >
    Next
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>


      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {isError && (
        <div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-red-800 font-medium">Error loading data</h3>
          </div>
          <p className="text-red-600 mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && revenueData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.totalRevenue || 0} KWD</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.totalSubscriptions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Delay</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.averageDelayMinutes.toFixed(2)} min</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userAnalytics.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Revenue by Plan Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution by Plan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataWithPercent}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(props) => {
                      const percent = (props.percent as number ?? 0) * 100;
                      return `${props.name}: ${percent.toFixed(1)}%`;
                    }}
                  >
                    {pieDataWithPercent.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} KWD`, 'Revenue']}
                    labelFormatter={(name) => `Plan: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by User Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by User</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(name) => (name.length > 15 ? name.slice(0, 15) + "..." : name)}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => [`${value} KWD`, 'Revenue']}
                    labelFormatter={(label) => `User: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    activeDot={{ r: 6, fill: '#2563EB' }}
                    dot={{ fill: '#2563EB', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Delay Tab */}
      {activeTab === "delays" && delayData && (
        <div className="space-y-6">
          {(delayData.delayedOrders || []).length === 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Delayed Orders</h3>
              <p className="text-gray-500">All orders are currently on time. Great work!</p>
            </div>
          )}

          {(delayData.delayedOrders || []).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Delayed Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Monitor and track delayed delivery orders</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delayed Meals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPageItems(delayData.delayedOrders).map((order: DeliveryDelay) => {
                      const isDelayed = order.orderStatus === "delayed" || order.paymentStatus === "delayed";
                      
                      return (
                        <tr 
                          key={order._id} 
                          className={isDelayed ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{order._id}</code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.userId?.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.orderStatus === "delayed" 
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {order.orderStatus || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.paymentStatus === "delayed" 
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {order.paymentStatus || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.meals?.map((meal) => (
                              <div key={meal._id} className="mb-2 last:mb-0 p-2 bg-gray-50 rounded">
                                <div className="font-medium">{meal.productId.name || "N/A"}</div>
                                <div className="text-xs text-gray-500">
                                  {meal.slot} • Qty: {meal.quantity} • Status: {meal.status}
                                </div>
                              </div>
                            )) || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.subscriptionId ? (
                              <div className="space-y-1">
                                <div><span className="font-medium">Plan:</span> {order.subscriptionId.planName || "N/A"}</div>
                                <div><span className="font-medium">Type:</span> {order.subscriptionId.planType || "N/A"}</div>
                                <div><span className="font-medium">Period:</span> {new Date(order.subscriptionId.startDate).toLocaleDateString()} - {new Date(order.subscriptionId.endDate).toLocaleDateString()}</div>
                              </div>
                            ) : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              isDelayed 
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}>
                              {isDelayed ? "Delayed" : "On Time"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages(delayData.delayedOrders)}</span>
                </span>
                
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages(delayData.delayedOrders)))}
                  disabled={page === totalPages(delayData.delayedOrders)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tickFormatter={(name) => (name.length > 15 ? name.slice(0, 15) + "..." : name)}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => [`${value} KWD`, 'Revenue']}
                labelFormatter={(label) => `User: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1D4ED8" 
                strokeWidth={3} 
                activeDot={{ r: 6, fill: '#1D4ED8' }}
                dot={{ fill: '#1D4ED8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Analytics Tab */}
      {activeTab === "userAnalytics" && userAnalytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Customer spending and order patterns</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageItems(userAnalytics).map((user: UserAnalytics) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {user.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {user.totalSpent.toFixed(2)} KWD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages(userAnalytics)}</span>
            </span>
            
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages(userAnalytics)))}
              disabled={page === totalPages(userAnalytics)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delivery Partner Analytics Tab */}
      {activeTab === "deliveryPartnerAnalytics" && partnerAnalytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Delivery Partner Performance</h3>
            <p className="text-sm text-gray-600 mt-1">Track delivery efficiency and performance metrics</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deliveries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delayed Deliveries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageItems(partnerAnalytics).map((partner: PartnerAnalytics) => {
                  const successRate = partner.totalDeliveries > 0 
                    ? ((partner.totalDeliveries - partner.delayedDeliveries) / partner.totalDeliveries) * 100 
                    : 0;
                  
                  return (
                    <tr key={partner.partnerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {partner.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.totalDeliveries}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.delayedDeliveries > 0 
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {partner.delayedDeliveries}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          successRate >= 95 
                            ? "bg-green-100 text-green-800"
                            : successRate >= 90
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {successRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages(partnerAnalytics)}</span>
            </span>
            
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages(partnerAnalytics)))}
              disabled={page === totalPages(partnerAnalytics)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}