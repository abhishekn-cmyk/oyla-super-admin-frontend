import { useState, useMemo, useEffect } from "react";
import { Plus, Utensils, User, X, Lock, Unlock, MoreVertical, Play, Pause, RotateCcw, Trash2, Edit, CreditCard, Snowflake } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useSubscriptionActions,
  // useGetAllStats,
  useDeleteSubscription,useChangeWindow
 
} from "../../hooks/useSubscription";

import { useUsers } from "../../hooks/user";
import type { ISubscription } from "../../types/subscription";
import type { IUser } from "../../types/user";
import Payments from "../Payment/Payment";
import { useProducts } from "../../hooks/useProduct";
import { useUpdateChangeWindow } from "../../hooks/useSystemsetting";

const ITEMS_PER_PAGE = 4;

// Add interface for meal form
interface MealForm {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  isLocked: boolean;
  status: "cancelled" | "pending" | "delivered" | "skipped"; 
}

// Add interface for form state
interface FormState {
  planType: "basic" | "premium" | "pro";
  planName: string;
  startDate: string;
  endDate: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "yearly"|"custom";
  mealsPerDay: number;
  totalMeals: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  durationDays: number;
  meals: MealForm[];
}

export default function Subscription() {
  const { data: subs = [], isLoading, refetch } = useGetSubscriptions();
  console.log(subs);
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const { users = []} = useUsers();
  // const states = useGetAllStats();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ISubscription | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState<number>(3); // default value
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock products data - you should replace this with actual data from your API
  const { data: products = [] } = useProducts();
   const { mutate: triggerChangeWindow, isPending } = useChangeWindow();

  const [form, setForm] = useState<FormState>({
    planType: "basic",
    planName: "",
    startDate: "",
    endDate: "",
    price: 0,
    billingCycle: "monthly",
    mealsPerDay: 3,
    totalMeals: 0,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    durationDays: 7,
    meals: [],
  });

  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showMealsModal, setShowMealsModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("");
  const [selectedSubscription, setSelectedSubscription] = useState<ISubscription | null>(null);

  // Initialize meals when durationDays changes
  useEffect(() => {
    if (form.durationDays > 0 && form.startDate) {
      const meals: MealForm[] = [];
      const startDate = new Date(form.startDate);
      
      for (let i = 0; i < form.durationDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        meals.push({
          date: currentDate.toISOString().split('T')[0],
          breakfast: "",
          lunch: "",
          dinner: "",
          isLocked: false,
          status: "pending"
        });
      }
      setForm(prev => ({ ...prev, meals }));
    }
  }, [form.durationDays, form.startDate]);

  // Reset form
  const resetForm = () => {
    setForm({
      planType: "basic",
      planName: "",
      startDate: "",
      endDate: "",
      price: 0,
      billingCycle: "monthly",
      mealsPerDay: 3,
      totalMeals: 0,
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      durationDays: 7,
      meals: [],
    });
    setEditing(null);
    setSelectedUserId("");
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    const payload = {
      planType: form.planType,
      planName: form.planName,
      startDate: form.startDate,
      endDate: form.endDate,
      durationDays: form.totalMeals
        ? Math.ceil(form.totalMeals / form.mealsPerDay)
        : form.durationDays,
      mealsPerDay: form.mealsPerDay,
      totalMeals: form.totalMeals,
      price: form.price,
      billingCycle: form.billingCycle,
      deliveryAddress: {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      },
      meals: form.meals,
    };

    if (editing) {
      updateMutation.mutate(
        { userId: selectedUserId, id: editing._id, data: payload },
        {
          onSuccess: () => {
            toast.success("Subscription updated");
            resetForm();
            setShowModal(false);
          },
          onError: (err: any) => toast.error(err.message || "Update failed"),
        }
      );
    } else {
      createMutation.mutate(
        { userId: selectedUserId, data: payload },
        {
          onSuccess: () => {
            toast.success("Subscription created");
            resetForm();
            setShowModal(false);
          },
          onError: (err: any) => toast.error(err.message || "Create failed"),
        }
      );
    }
  };

  // Pagination
  const totalPages = Math.ceil(subs.length / ITEMS_PER_PAGE);
  const paginatedSubs = useMemo(
    () =>
      subs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [subs, currentPage]
  );

  const stats = {
  total: subs.length,
  active: subs.filter((s) => s.status === "active" || s.status === "pending").length,
  cancelled: subs.filter((s) => s.status === "cancelled").length,
  expired: subs.filter((s) => s.status === "expired").length,
  paused: subs.filter((s) => s.status === "paused").length,
  freeze: subs.filter((s) => s.status === "freeze").length,
};

// Total of paused + freeze
const totalPauseFreeze = stats.paused + stats.freeze;

console.log(totalPauseFreeze);
const updateChangeWindowMutation = useUpdateChangeWindow();

  const handleSettings = () => {
    if (days <= 0) {
      toast.error("Days must be greater than 0");
      return;
    }

    updateChangeWindowMutation.mutate(
      { days },
      {
        onSuccess: () => {
          setIsOpen(false); // close modal
          setIsSubmitting(false);
        },
      }
    );
  };



  // Handle edit click
  const handleEdit = (sub: ISubscription) => {
    setEditing(sub);
    setShowModal(true);
    setSelectedUserId(typeof sub.userId === "string" ? sub.userId : sub.userId._id);
    
    // Initialize meals for editing
    const meals: MealForm[] = sub.meals?.map((meal: any) => ({
      date: meal.date || "",
      breakfast: typeof meal.breakfast === 'string' ? meal.breakfast : meal.breakfast?._id || "",
      lunch: typeof meal.lunch === 'string' ? meal.lunch : meal.lunch?._id || "",
      dinner: typeof meal.dinner === 'string' ? meal.dinner : meal.dinner?._id || "",
      isLocked: meal.isLocked || false,
      status: meal.status || "pending"
    })) || [];

    setForm({
      planType: sub.planType || "basic",
      planName: sub.planName || "",
      startDate: sub.startDate ? sub.startDate.split("T")[0] : "",
      endDate: sub.endDate ? sub.endDate.split("T")[0] : "",
      price: sub.price || 0,
      billingCycle: sub.billingCycle || "monthly",
      mealsPerDay: sub.mealsPerDay || 3,
      totalMeals: sub.totalMeals || 0,
      street: sub.deliveryAddress?.street || "",
      city: sub.deliveryAddress?.city || "",
      state: sub.deliveryAddress?.state || "",
      zipCode: sub.deliveryAddress?.zipCode || "",
      country: sub.deliveryAddress?.country || "",
      durationDays: sub.durationDays || 7,
      meals,
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border border-red-200";
      case "expired":
        return "text-gray-600 bg-gray-50 border border-gray-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border border-blue-200";
      case "paused":
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "frozen":
        return "text-cyan-600 bg-cyan-50 border border-cyan-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  // Get meal icon
  const getMealIcon = (mealType: string) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🥗';
      case 'dinner':
        return '🍲';
      default:
        return '🍽️';
    }
  };

  // Open meals modal
  const openMealsModal = (sub: ISubscription) => {
    setSelectedSubscription(sub);
    setShowMealsModal(true);
  };

  // Close meals modal
  const closeMealsModal = () => {
    setShowMealsModal(false);
    setSelectedSubscription(null);
  };

  // Toggle meal lock
  const toggleMealLock = (mealIndex: number) => {
    if (!selectedSubscription || !updateMutation) return;

    const meal = selectedSubscription.meals[mealIndex];
    const updatedMeals = [...selectedSubscription.meals];
    updatedMeals[mealIndex] = {
      ...meal,
      isLocked: !meal.isLocked,
    };

    const userId = typeof selectedSubscription.userId === "string" 
      ? selectedSubscription.userId 
      : selectedSubscription.userId._id;

    updateMutation.mutate(
      { 
        userId, 
        id: selectedSubscription._id, 
        data: { meals: updatedMeals } 
      },
      {
        onSuccess: () => {
          toast.success(`Meal ${meal.isLocked ? 'unlocked' : 'locked'} successfully`);
          // Update local state
          setSelectedSubscription({
            ...selectedSubscription,
            meals: updatedMeals
          });
        },
        onError: (err: any) => toast.error(err.message || "Failed to update meal"),
      }
    );
  };

  // Lock/Unlock all meals
  const toggleAllMealsLock = (lock: boolean) => {
    if (!selectedSubscription || !updateMutation) return;

    const updatedMeals = selectedSubscription.meals.map(meal => ({
      ...meal,
      isLocked: lock
    }));

    const userId = typeof selectedSubscription.userId === "string" 
      ? selectedSubscription.userId 
      : selectedSubscription.userId._id;

    updateMutation.mutate(
      { 
        userId, 
        id: selectedSubscription._id, 
        data: { meals: updatedMeals } 
      },
      {
        onSuccess: () => {
          toast.success(`All meals ${lock ? 'locked' : 'unlocked'} successfully`);
          setSelectedSubscription({
            ...selectedSubscription,
            meals: updatedMeals
          });
        },
        onError: (err: any) => toast.error(err.message || "Failed to update meals"),
      }
    );
  };
 const { 
  pauseSubscription, 
  resumeSubscription, 
  cancelSubscription 
} = useSubscriptionActions();

const handlePause = (sub: ISubscription) => {
  console.log('Pausing subscription:', sub._id);
  pauseSubscription.mutate(sub._id, {
    onSuccess: () => {
      setActiveDropdown(null);
      refetch(); // Make sure refetch is defined
    },
    onError: (err) => {
      console.error('Pause error:', err);
      setActiveDropdown(null);
    },
  });
};

const handleResume = (sub: ISubscription) => {
  console.log('Resuming subscription:', sub._id);
  resumeSubscription.mutate(sub._id, {
    onSuccess: () => {
      setActiveDropdown(null);
      refetch();
    },
    onError: (err) => {
      console.error('Resume error:', err);
      setActiveDropdown(null);
    },
  });
};

const handleCancel = (sub: ISubscription) => {
  console.log('Cancelling subscription:', sub._id);
  const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;
  
  cancelSubscription.mutate(
    { subscriptionId: sub._id, userId },
    {
      onSuccess: () => {
        setActiveDropdown(null);
        refetch();
      },
      onError: (err) => {
        console.error('Cancel error:', err);
        setActiveDropdown(null);
      },
    }
  );
};

  // Freeze subscription (custom implementation using update)
  const handleFreeze = (sub: ISubscription) => {
    const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;
    updateMutation.mutate(
      { userId, id: sub._id, data: { status: "freeze" } },
      {
        onSuccess: () => {
          toast.success("Subscription frozen successfully");
          setActiveDropdown(null);
        },
        onError: (err: any) => toast.error(err.message || "Freeze failed"),
      }
    );
  };

  // Unfreeze subscription
  const handleUnfreeze = (sub: ISubscription) => {
    const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;
    updateMutation.mutate(
      { userId, id: sub._id, data: { status: "active" } },
      {
        onSuccess: () => {
          toast.success("Subscription unfrozen successfully");
          setActiveDropdown(null);
        },
        onError: (err: any) => toast.error(err.message || "Unfreeze failed"),
      }
    );
  };

  const handleActivate = (sub: ISubscription) => {
    const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;
    updateMutation.mutate(
      { userId, id: sub._id, data: { status: "active" } },
      {
        onSuccess: () => {
          toast.success("Subscription activated");
          setActiveDropdown(null);
        },
        onError: (err: any) => toast.error(err.message || "Activation failed"),
      }
    );
  };

  const handleRenew = (sub: ISubscription) => {
    const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30); // Extend by 30 days
    
    updateMutation.mutate(
      { 
        userId, 
        id: sub._id, 
        data: { 
          status: "active",
          endDate: newEndDate.toISOString().split('T')[0]
        } 
      },
      {
        onSuccess: () => {
          toast.success("Subscription renewed");
          setActiveDropdown(null);
        },
        onError: (err: any) => toast.error(err.message || "Renewal failed"),
      }
    );
  };

  const deleteMutation = useDeleteSubscription();

  const handleDelete = (sub: ISubscription) => {
    if (
      window.confirm(
        "Are you sure you want to delete this subscription? This action cannot be undone."
      )
    ) {
      const userId = typeof sub.userId === "string" ? sub.userId : sub.userId._id;

      deleteMutation.mutate(
        { userId, id: sub._id },
        {
          onSuccess: () => {
            toast.success("Subscription deleted successfully!");
            setActiveDropdown(null);
          },
          onError: (err: any) =>
            toast.error(err?.message || "Failed to delete subscription"),
        }
      );
    }
  };

  // Toggle dropdown
  const toggleDropdown = (subscriptionId: string) => {
    setActiveDropdown(activeDropdown === subscriptionId ? null : subscriptionId);
  };

  // Check if action is available based on current status
  const canPause = (sub: ISubscription) => {
    return ["active", "pending"].includes(sub.status);
  };

  const canResume = (sub: ISubscription) => {
    return ["paused", "freeze"].includes(sub.status);
  };

  const canFreeze = (sub: ISubscription) => {
    return ["active", "pending"].includes(sub.status);
  };

  const canUnfreeze = (sub: ISubscription) => {
    return sub.status === "freeze";
  };

  const canCancel = (sub: ISubscription) => {
    return !["cancelled", "expired", "completed"].includes(sub.status);
  };

  const canActivate = (sub: ISubscription) => {
    return ["paused", "freeze", "cancelled"].includes(sub.status);
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Subscription Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-300 border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Subscriptions</p>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg shadow hover:shadow-lg transition duration-300 border border-green-100">
          <p className="text-gray-500 text-sm font-medium">Active</p>
          <p className="text-2xl font-semibold text-green-700 mt-2">{stats.active}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg shadow hover:shadow-lg transition duration-300 border border-orange-100">
          <p className="text-gray-500 text-sm font-medium">Paused/Frozen</p>
          <p className="text-2xl font-semibold text-orange-600 mt-2">{totalPauseFreeze}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg shadow hover:shadow-lg transition duration-300 border border-yellow-100">
          <p className="text-gray-500 text-sm font-medium">Cancelled</p>
          <p className="text-2xl font-semibold text-yellow-600 mt-2">
            {stats.cancelled}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg shadow hover:shadow-lg transition duration-300 border border-red-100">
          <p className="text-gray-500 text-sm font-medium">Expired</p>
          <p className="text-2xl font-semibold text-red-600 mt-2">{stats.expired}</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">All Subscriptions</h2>
        <button
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-300"
        >
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Plan Name",
                "User Details",
                "Type",
                "Payment Status",
                "Status",
                "Meals Progress",
                "Price",
                "Duration",
                "Meal Details",
                "Actions"
              ].map((title) => (
                <th
                  key={title}
                  className="px-4 py-3 text-left font-medium text-gray-700 uppercase tracking-wider text-xs"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Loading subscriptions...
                  </div>
                </td>
              </tr>
            ) : paginatedSubs.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-4xl mb-2">📋</div>
                    <p className="text-lg font-medium">No subscriptions found</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first subscription to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSubs.map((sub) => (
                <tr 
                  key={sub._id} 
                  className="hover:bg-gray-50 transition duration-150"
                >
                  {/* Plan Name */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{sub.planName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sub.billingCycle && `Billed ${sub.billingCycle}`}
                    </div>
                  </td>

                  {/* User Details */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sub.userId && typeof sub.userId !== "string"
                            ? sub.userId.username || "Unknown User"
                            : "User Not Found"}
                        </div>
                        {sub.userId && typeof sub.userId !== "string" && sub.userId.email && (
                          <div className="text-xs text-gray-500">
                            {sub.userId.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Plan Type */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      sub.planType === 'premium' 
                        ? 'bg-purple-100 text-purple-800' 
                        : sub.planType === 'pro'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sub.planType}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
                    >
                      {sub.payments && sub.payments.length > 0
                        ? sub.payments[sub.payments.length - 1].status
                        : "Not Applicable"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>

                  {/* Meals Progress */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {sub.consumedMeals || 0}/{sub.totalMeals || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sub.mealsPerDay || 0} per day
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ 
                          width: `${sub.totalMeals ? Math.max((sub.consumedMeals || 0) / sub.totalMeals * 100, 5) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{sub.price || 0}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      to {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}
                    </div>
                    {sub.endDate && new Date(sub.endDate) < new Date() && (
                      <div className="text-xs text-red-500 mt-1">Expired</div>
                    )}
                  </td>

                  {/* Meal Details */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => openMealsModal(sub)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition duration-300"
                    >
                      <Utensils size={14} />
                      View Meals
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {sub.meals?.length || 0}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Primary Actions */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition duration-300"
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubscriptionId(sub._id);
                            setShowPaymentsModal(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition duration-300"
                        >
                          <CreditCard size={12} />
                          Payments
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(sub._id)}
                          className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
                        >
                          <MoreVertical size={14} className="text-gray-600" />
                        </button>

                        {activeDropdown === sub._id && (
                          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              {/* Status Management */}
                              {canActivate(sub) && (
                                <button
                                  onClick={() => handleActivate(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition"
                                >
                                  <Play size={14} />
                                  Activate
                                </button>
                              )}
                              
                              {canPause(sub) && (
                                <button
                                  onClick={() => handlePause(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition"
                                >
                                  <Pause size={14} />
                                  Pause
                                </button>
                              )}
                              
                              {canResume(sub) && (
                                <button
                                  onClick={() => handleResume(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                                >
                                  <Play size={14} />
                                  Resume
                                </button>
                              )}

                              {canFreeze(sub) && (
                                <button
                                  onClick={() => handleFreeze(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-50 transition"
                                >
                                  <Snowflake size={14} />
                                  Freeze
                                </button>
                              )}

                              {canUnfreeze(sub) && (
                                <button
                                  onClick={() => handleUnfreeze(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-50 transition"
                                >
                                  <Snowflake size={14} />
                                  Unfreeze
                                </button>
                              )}

                              {canCancel(sub) && (
                                <button
                                  onClick={() => handleCancel(sub)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition"
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              )}

                              {/* Divider */}
                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Additional Actions */}
                              <button
                                onClick={() => handleRenew(sub)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                              >
                                <RotateCcw size={14} />
                                Renew
                              </button>
                              <button
                                onClick={() => openMealsModal(sub)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition"
                              >
                                <Utensils size={14} />
                                Manage Meals
                              </button>

                              {/* Divider */}
                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Dangerous Actions */}
                              <button
                                onClick={() => handleDelete(sub)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, subs.length)}
            </span> of{" "}
            <span className="font-medium">{subs.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border text-sm font-medium rounded-md transition ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editing ? "Edit Subscription" : "Add Subscription"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* USER SELECTION */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a user...</option>
                {users.map((user: IUser) => (
                  <option key={user._id} value={user._id}>
                    {user.username || user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* PLAN DETAILS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={form.planName}
                  onChange={(e) => setForm({ ...form, planName: e.target.value })}
                  placeholder="e.g. 14-Day Premium Plan"
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
                <select
                  value={form.planType}
                  onChange={(e) => setForm({ ...form, planType: e.target.value as "basic" | "premium" | "pro" })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>

            {/* DURATION & PRICE */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days) *</label>
                <input
                type="number"
                min="7"
                step="7"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: +e.target.value })}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: +e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* MEAL SCHEDULE */}
            {form.meals.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2">Meal Schedule</h3>
                {form.meals.map((m: MealForm, idx: number) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Day {idx + 1}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(m.date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Breakfast */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Breakfast</label>
                      <select
                        value={m.breakfast || ""}
                        onChange={(e) => {
                          const newMeals = [...form.meals];
                          newMeals[idx].breakfast = e.target.value;
                          setForm({ ...form, meals: newMeals });
                        }}
                        className="w-full border border-gray-300 p-2 rounded-lg"
                      >
                        <option value="">Select Breakfast...</option>
                        {products.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Lunch */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Lunch</label>
                      <select
                        value={m.lunch || ""}
                        onChange={(e) => {
                          const newMeals = [...form.meals];
                          newMeals[idx].lunch = e.target.value;
                          setForm({ ...form, meals: newMeals });
                        }}
                        className="w-full border border-gray-300 p-2 rounded-lg"
                      >
                        <option value="">Select Lunch...</option>
                        {products.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dinner */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dinner</label>
                      <select
                        value={m.dinner || ""}
                        onChange={(e) => {
                          const newMeals = [...form.meals];
                          newMeals[idx].dinner = e.target.value;
                          setForm({ ...form, meals: newMeals });
                        }}
                        className="w-full border border-gray-300 p-2 rounded-lg"
                      >
                        <option value="">Select Dinner...</option>
                        {products.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meals Modal */}
      {showMealsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Utensils size={20} />
                  Meal Details - {selectedSubscription.planName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  User: {selectedSubscription.userId && typeof selectedSubscription.userId !== "string" 
                    ? selectedSubscription.userId.username || selectedSubscription.userId.email 
                    : "Unknown User"}
                </p>
              </div>
              <button
                onClick={closeMealsModal}
                className="text-gray-500 hover:text-gray-800 transition p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total meals: {selectedSubscription.meals?.length || 0} • 
                  Locked: {selectedSubscription.meals?.filter(m => m.isLocked).length || 0} • 
                  Unlocked: {selectedSubscription.meals?.filter(m => !m.isLocked).length || 0}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllMealsLock(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded-lg transition"
                  >
                    <Lock size={14} />
                    Lock All
                  </button>
                  <button
                    onClick={() => toggleAllMealsLock(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-medium rounded-lg transition"
                  >
                    <Unlock size={14} />
                    Unlock All
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(!selectedSubscription.meals || selectedSubscription.meals.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No meal details available</p>
                  <p className="text-sm mt-1">This subscription doesn't have any meals configured</p>
                </div>
              ) : (
                <>
                 <button
        className="bg-purple-600 text-white px-2 py-1 mb-2 rounded text-xs font-medium hover:bg-purple-700 transition"
        onClick={() => setIsOpen(true)}
      >
        Update change window settings
      </button>
     {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-medium mb-4">Update Change Window</h2>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Number of days:
            </label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-1 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 text-sm"
                onClick={handleSettings}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Updating..."
                  : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
  {selectedSubscription.meals.map((meal, index) => (
    <div
      key={index}
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="font-medium text-gray-900">
          📅 {meal.date ? new Date(meal.date).toLocaleDateString() : `Day ${index + 1}`}
        </div>

        {/* Buttons aligned right */}
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
          <button
            onClick={() => toggleMealLock(index)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
              meal.isLocked
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            {meal.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
            {meal.isLocked ? "Unlock" : "Lock"}
          </button>

          <button
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 transition"
            onClick={() => triggerChangeWindow()}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Lock Meals (Change Window)"}
          </button>
        </div>
       
      </div>

      {/* Meal Details */}
      <div className="space-y-2">
        {/* Breakfast */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-700">
            {getMealIcon('breakfast')} Breakfast:
          </span>
          <span className="font-medium text-gray-900">
            {meal.breakfast ? (
              typeof meal.breakfast === 'object' ? (
                <span className="text-green-600">{(meal.breakfast as any).name || 'Selected'}</span>
              ) : (
                <span className="text-green-600">Selected</span>
              )
            ) : (
              <span className="text-gray-400">Not selected</span>
            )}
          </span>
        </div>

        {/* Lunch */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-700">
            {getMealIcon('lunch')} Lunch:
          </span>
          <span className="font-medium text-gray-900">
            {meal.lunch ? (
              typeof meal.lunch === 'object' ? (
                <span className="text-green-600">{(meal.lunch as any).name || 'Selected'}</span>
              ) : (
                <span className="text-green-600">Selected</span>
              )
            ) : (
              <span className="text-gray-400">Not selected</span>
            )}
          </span>
        </div>

        {/* Dinner */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-700">
            {getMealIcon('dinner')} Dinner:
          </span>
          <span className="font-medium text-gray-900">
            {meal.dinner ? (
              typeof meal.dinner === 'object' ? (
                <span className="text-green-600">{(meal.dinner as any).name || 'Selected'}</span>
              ) : (
                <span className="text-green-600">Selected</span>
              )
            ) : (
              <span className="text-gray-400">Not selected</span>
            )}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <span
            className={`px-2 py-1 rounded-full ${
              meal.isLocked ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            }`}
          >
            {meal.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
          </span>
          <span className="text-gray-500">Day {index + 1}</span>
        </div>
      </div>
    </div>
  ))}
</div>
</>

              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Showing {selectedSubscription.meals?.length || 0} meals • 
                  Meals per day: {selectedSubscription.mealsPerDay || 0}
                </span>
                <button
                  onClick={closeMealsModal}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPaymentsModal && selectedSubscriptionId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPaymentsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Subscription Payments</h3>
            <Payments
              subscriptionId={selectedSubscriptionId}
              token={localStorage.getItem("token") || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}