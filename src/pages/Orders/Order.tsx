import { useState } from "react";
import { 
   ShoppingCart, DollarSign, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, Loader, Search, Filter, User, X, TrendingUp,
  BarChart3, List, AlertCircle, Package, Clock, CheckCircle, XCircle
} from "lucide-react";

import { 
  useGetOrderStats, useToggleOrderStatus, useDeleteOrder 
} from "../../hooks/useorder";
import type { IOrder, IOrderStats } from "../../types/order";
import type { IMeal } from "../../types/order";
import type { IProduct } from "../../types/product";

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  const handleReset = () => {
    setHasError(false);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500 min-h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-gray-600 mt-2">
            There was an error loading the orders. Please try refreshing the page.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
};

// Status Cards Component
const StatusCards = ({ stats }: { stats: IOrderStats | undefined }) => {
  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    pending: { 
      color: "bg-yellow-50 border-yellow-200 text-yellow-800", 
      label: "Pending", 
      icon: <Clock className="w-5 h-5" />
    },
    confirmed: { 
      color: "bg-blue-50 border-blue-200 text-blue-800", 
      label: "Confirmed", 
      icon: <CheckCircle className="w-5 h-5" />
    },
    preparing: { 
      color: "bg-orange-50 border-orange-200 text-orange-800", 
      label: "Preparing", 
      icon: <Package className="w-5 h-5" />
    },
    out_for_delivery: { 
      color: "bg-purple-50 border-purple-200 text-purple-800", 
      label: "Out for Delivery", 
      icon: <Package className="w-5 h-5" />
    },
    delivered: { 
      color: "bg-green-50 border-green-200 text-green-800", 
      label: "Delivered", 
      icon: <CheckCircle className="w-5 h-5" />
    },
    cancelled: { 
      color: "bg-red-50 border-red-200 text-red-800", 
      label: "Cancelled", 
      icon: <XCircle className="w-5 h-5" />
    },
    scheduled: { 
      color: "bg-indigo-50 border-indigo-200 text-indigo-800", 
      label: "Scheduled", 
      icon: <Clock className="w-5 h-5" />
    },
    prepared: { 
      color: "bg-teal-50 border-teal-200 text-teal-800", 
      label: "Prepared", 
      icon: <Package className="w-5 h-5" />
    },
    dispatched: { 
      color: "bg-purple-50 border-purple-200 text-purple-800", 
      label: "Dispatched", 
      icon: <Package className="w-5 h-5" />
    },
    delayed: { 
      color: "bg-red-50 border-red-200 text-red-800", 
      label: "Delayed", 
      icon: <Clock className="w-5 h-5" />
    },
    completed: { 
      color: "bg-green-50 border-green-200 text-green-800", 
      label: "Completed", 
      icon: <CheckCircle className="w-5 h-5" />
    },
    paid: { 
      color: "bg-emerald-50 border-emerald-200 text-emerald-800", 
      label: "Paid", 
      icon: <DollarSign className="w-5 h-5" />
    }
  };

  if (!stats?.statusCount) return null;

  return (
    <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
      {Object.entries(stats.statusCount).map(([status, count]) => {
        const config = statusConfig[status] || { 
          color: "bg-gray-50 border-gray-200 text-gray-800", 
          label: status,
          icon: <Package className="w-5 h-5" />
        };
        
        return (
          <div key={status} className={`border rounded-xl p-4 ${config.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm font-medium mt-1">{config.label}</p>
              </div>
              <div className="opacity-70">
                {config.icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main Orders Component
function OrdersContent() {
  const { data: stats, isLoading: statsLoading, error } = useGetOrderStats();
  const toggleStatusMutation = useToggleOrderStatus();
  const deleteMutation = useDeleteOrder();

  // Get orders from stats data
  const orders = stats?.allOrders || [];
  const isLoading = statsLoading;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "analytics">("overview");

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Helper functions
  const getStatusBadge = (status: string | undefined) => {
    const statusConfig = {
      pending: { color: "bg-gray-100 text-gray-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      preparing: { color: "bg-yellow-100 text-yellow-800", label: "Preparing" },
      out_for_delivery: { color: "bg-purple-100 text-purple-800", label: "Out for Delivery" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      scheduled: { color: "bg-indigo-100 text-indigo-800", label: "Scheduled" },
      prepared: { color: "bg-orange-100 text-orange-800", label: "Prepared" },
      dispatched: { color: "bg-purple-100 text-purple-800", label: "Dispatched" },
      delayed: { color: "bg-red-100 text-red-800", label: "Delayed" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      paid: { color: "bg-blue-100 text-blue-800", label: "Paid" }
    };
    
    const safeStatus = status || 'pending';
    const config = statusConfig[safeStatus as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string | undefined) => {
    if (!paymentStatus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    }

    const paymentConfig = {
      pending: { color: "bg-gray-100 text-gray-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-yellow-100 text-yellow-800", label: "Refunded" }
    };
    
    const config = paymentConfig[paymentStatus.toLowerCase() as keyof typeof paymentConfig] || paymentConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

 
  
  // Total items
  const getTotalItems = (order: IOrder): number => {
    return order.meals?.length || 0;
  };

  // Total cost - use order.totalCost if available, otherwise calculate
  const getTotalCost = (order: IOrder): number => {
    if (order.totalCost !== undefined && order.totalCost !== 0) {
      return order.totalCost;
    }
    
    return order.meals?.reduce((sum, meal) => {
      const mealCost = getMealCost(meal);
      return sum + mealCost;
    }, 0) || 0;
  };

  // Total price - use order.totalPrice if available, otherwise calculate
  const getTotalPrice = (order: IOrder): number => {
    if (order.totalPrice !== undefined && order.totalPrice !== 0) {
      return order.totalPrice;
    }
    
    // Check if it's a subscription order
    if (order.subscriptionId && typeof order.subscriptionId === 'object') {
      return order.subscriptionId.price || 0;
    }
    
    // Calculate from meals
    return order.meals?.reduce((sum, meal) => {
      const mealPrice = getMealPrice(meal);
      return sum + mealPrice;
    }, 0) || 0;
  };

  // Calculate profit - use order.profit if available, otherwise calculate
  const getProfit = (order: IOrder): number => {
    if (order.profit !== undefined && order.profit !== 0) {
      return order.profit;
    }
    return getTotalPrice(order) - getTotalCost(order);
  };

  const getMealPrice = (meal: IMeal): number => {
    if (meal.price !== undefined) return meal.price;
    if (typeof meal.productId === "object" && meal.productId !== null) {
      return (meal.productId as IProduct).price || 0;
    }
    return 0;
  };

  const getMealCost = (meal: IMeal): number => {
    if (meal.costPrice !== undefined) return meal.costPrice;
    if (typeof meal.productId === "object" && meal.productId !== null) {
      return (meal.productId as IProduct).costPrice || 0;
    }
    return 0;
  };

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleToggleStatus = (orderId: string) => {
    toggleStatusMutation.mutate(orderId);
  };
  
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteMutation.mutate(orderId);
    }
  };

  const totalOrder = stats
    ? Object.values(stats.statusCount || {}).reduce((sum, count) => sum + (count || 0), 0)
    : 0;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `KWD ${amount.toFixed(3)}`;
  };

  // Analytics calculations
  const getAnalyticsData = () => {
    // Use stats data directly since it's already calculated on the server
    if (stats) {
      const paymentMethodDistribution = orders.reduce((acc, order) => {
        const method = order.paymentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue: stats.totalRevenue || 0,
        totalCost: stats.totalCost || 0,
        totalProfit: stats.totalProfit || 0,
        statusDistribution: stats.statusCount || {},
        paymentMethodDistribution,
        monthlyRevenue: {},
        dailyOrders: stats.dailyOrders || [],
        totalOrders: stats.totalOrders || 0
      };
    }

    // Fallback to client-side calculations if stats not available
    const totalRevenue = orders.reduce((sum, order) => sum + getTotalPrice(order), 0);
    const totalCost = orders.reduce((sum, order) => sum + getTotalCost(order), 0);
    const totalProfit = totalRevenue - totalCost;
    
    const statusDistribution = orders.reduce((acc, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentMethodDistribution = orders.reduce((acc, order) => {
      const method = order.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + getTotalPrice(order);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      statusDistribution,
      paymentMethodDistribution,
      monthlyRevenue,
      dailyOrders: [],
      totalOrders: orders.length
    };
  };

  const analyticsData = getAnalyticsData();

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500 py-8">
        Error loading orders. Please try again later.
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 size={18} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <List size={18} />
                Orders List
                <span className="bg-gray-100 text-gray-900 ml-2 py-0.5 px-2 rounded-full text-xs">
                  {orders.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <TrendingUp size={18} />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: "Total Orders", 
                  value: stats?.totalOrders, 
                  icon: <ShoppingCart className="w-6 h-6 text-blue-600"/>, 
                  color: "bg-blue-50 border-blue-200", 
                  desc: "All time orders" 
                },
                { 
                  title: "Total Revenue", 
                  value: stats?.totalRevenue, 
                  icon: <DollarSign className="w-6 h-6 text-green-600"/>, 
                  color: "bg-green-50 border-green-200", 
                  desc: "Lifetime revenue", 
                  formatter: formatCurrency
                },
                { 
                  title: "Total Profit", 
                  value: stats?.totalProfit, 
                  icon: <TrendingUp className="w-6 h-6 text-purple-600"/>, 
                  color: "bg-purple-50 border-purple-200", 
                  desc: "Net profit", 
                  formatter: formatCurrency
                },
                { 
                  title: "Active Statuses", 
                  value: totalOrder, 
                  icon: <Package className="w-6 h-6 text-orange-600"/>, 
                  color: "bg-orange-50 border-orange-200", 
                  desc: "Total status orders" 
                }
              ].map(card => (
                <div key={card.title} className={`border rounded-xl p-6 ${card.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600 truncate">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2 truncate">
                        {isLoading ? "..." : (card.formatter ? card.formatter(card.value || 0) : (card.value?.toLocaleString() || "0"))}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg ml-3 flex-shrink-0 shadow-sm">
                      {card.icon}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="truncate">{card.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Distribution Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
              <StatusCards stats={stats} />
            </div>

          
          </div>
        )}

        {activeTab === "orders" && (
          <>
            {/* Controls */}
           <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  {/* Left: Search + Status */}
  <div className="flex items-center gap-4 flex-1 min-w-[280px]">
    {/* Search */}
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input 
        type="text" 
        placeholder="Search orders..." 
        value={searchTerm}
        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
      />
    </div>

    {/* Status Filter */}
    <div className="flex items-center gap-2 min-w-[150px]">
      <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
      <select 
        value={statusFilter} 
        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
      >
        <option value="all">All Status</option>
        <option value="scheduled">Scheduled</option>
        <option value="prepared">Prepared</option>
        <option value="dispatched">Dispatched</option>
        <option value="delivered">Delivered</option>
        <option value="delayed">Delayed</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="paid">Paid</option>
      </select>
    </div>
  </div>

  {/* Right: Items per page */}
  <div className="flex items-center gap-3 min-w-[180px] justify-end">
    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</label>
    <select 
      value={itemsPerPage} 
      onChange={handleItemsPerPageChange} 
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-20"
    >
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
    <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
  </div>
</div>


            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Order ID", "Customer", "Items", "Total", "Profit", "Status", "Payment", "Date", "Actions"].map(col => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center">
                          <div className="flex justify-center items-center">
                            <Loader className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading orders...</span>
                          </div>
                        </td>
                      </tr>
                    ) : currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          {orders.length === 0 ? "No orders found" : "No orders match your search criteria"}
                        </td>
                      </tr>
                    ) : (
                      currentOrders.map((order) => {
                        if (!order) return null;
                        
                        return (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {order._id?.substring(0, 8) || 'Unknown'}...
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {order.userId?.username || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.userId?.email || 'No email'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {getTotalItems(order)} items
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(getTotalPrice(order))}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              <span className={getProfit(order) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(getProfit(order))}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                {getPaymentBadge(order.paymentStatus)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(order._id)}
                                  className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                                  title="Update Status"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} entries
                    {filteredOrders.length !== orders.length && (
                      <span className="ml-2 text-gray-500">
                        (filtered from {orders.length} total orders)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        Math.abs(pageNum - currentPage) <= 1
                      )
                      .map((pageNum, index, array) => {
                        const showEllipsis = index < array.length - 1 && array[index + 1] !== pageNum + 1;
                        
                        return (
                          <div key={pageNum} className="flex items-center">
                            <button
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                            {showEllipsis && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                          </div>
                        );
                      })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Order Analytics</h2>

            {/* Top Metrics Overview */}
            <div className="grid grid-cols-4 md:grid-cols-3 gap-6">
              {/* Total Revenue */}
              <div className="bg-blue-50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(analyticsData.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>

              {/* Total Profit */}
              <div className="bg-green-50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Profit</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(analyticsData.totalProfit)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>

              {/* Profit Margin */}
              <div className="bg-purple-50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analyticsData.totalRevenue > 0
                      ? `${((analyticsData.totalProfit / analyticsData.totalRevenue) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            {/* Status & Payment Distribution */}
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({((count / analyticsData.totalOrders) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.paymentMethodDistribution).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 capitalize">{method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({((count / analyticsData.totalOrders) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Orders */}
           
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Order Details - {selectedOrder._id?.substring(0, 8).toUpperCase() || 'Unknown'}...
                  </h2>
                  <button 
                    onClick={() => setShowOrderModal(false)} 
                    className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Customer</label>
                      <p className="text-gray-900 text-sm sm:text-base">
                        {selectedOrder.userId?.username || 'Unknown'} ({selectedOrder.userId?.email || 'No email'})
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Payment</label>
                      <div className="mt-1 space-y-1">
                       
                        <div>{getPaymentBadge(selectedOrder.paymentStatus)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</label>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900">
                        {formatCurrency(getTotalPrice(selectedOrder))}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Total Cost</label>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900">
                        {formatCurrency(getTotalCost(selectedOrder))}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Profit</label>
                      <p className={`text-lg sm:text-xl font-semibold ${
                        getProfit(selectedOrder) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(getProfit(selectedOrder))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {selectedOrder.subscriptionId && typeof selectedOrder.subscriptionId === 'object' && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Subscription Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Plan:</span> {selectedOrder.subscriptionId.planName || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {selectedOrder.subscriptionId.planType || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> {formatCurrency(selectedOrder.subscriptionId.price || 0)}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {selectedOrder.subscriptionId.durationDays || 0} days
                      </div>
                    </div>
                  </div>
                )}

                {/* Meal Details */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Meal Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Meal</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Slot</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Product</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Cost</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.meals?.map((meal, index) => {
                          const isProductObj = typeof meal.productId === "object" && meal.productId !== null;
                          const mealPrice = getMealPrice(meal);
                          const mealCost = getMealCost(meal);

                          return (
                            <tr key={meal._id || index} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2">Meal {index + 1}</td>
                              <td className="px-3 py-2 capitalize">{meal.slot || 'N/A'}</td>
                              <td className="px-3 py-2">
                                {isProductObj ? (meal.productId as IProduct).name : 'Unknown Product'}
                              </td>
                              <td className="px-3 py-2 font-medium">{formatCurrency(mealPrice)}</td>
                              <td className="px-3 py-2 text-gray-600">{formatCurrency(mealCost)}</td>
                              <td className="px-3 py-2">{getStatusBadge(meal.status)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowOrderModal(false)}
                    className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => selectedOrder && handleToggleStatus(selectedOrder._id)}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main export with error boundary
export default function Orders() {
  return (
    <ErrorBoundary>
      <OrdersContent />
    </ErrorBoundary>
  );
}