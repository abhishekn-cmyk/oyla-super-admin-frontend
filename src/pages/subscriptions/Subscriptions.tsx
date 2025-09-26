import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
} from "../../hooks/useSubscription";
import { useUsers } from "../../hooks/user";
import type { ISubscription } from "../../types/subscription";
import type { IUser } from "../../types/user";

const ITEMS_PER_PAGE = 5; // change page size here

export default function Subscription() {
  const { data: subs = [], isLoading } = useGetSubscriptions();
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();
  const { users = [], loading: usersLoading } = useUsers();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ISubscription | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [form, setForm] = useState<{
    planType: "basic" | "premium" | "pro";
    planName: string;
    startDate: string;
    endDate: string;
    price: number;
    billingCycle: "monthly" | "quarterly" | "yearly";
    mealsPerDay: number;
    totalMeals: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>({
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
  });

  const [currentPage, setCurrentPage] = useState(1);

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
    });
    setEditing(null);
    setSelectedUserId("");
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    const payload = {
      ...form,
      deliveryAddress: {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      },
    };

    if (editing) {
      updateMutation.mutate(
        { userId: editing.userId, id: editing._id, data: payload },
        {
          onSuccess: () => {
            toast.success("Subscription updated");
            resetForm();
            setShowModal(false);
          },
          onError: () => toast.error("Update failed"),
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
          onError: () => toast.error("Create failed"),
        }
      );
    }
  };

  // Delete
  const handleDelete = (sub: ISubscription) => {
    if (!confirm("Delete this subscription?")) return;
    deleteMutation.mutate(
      { userId: sub.userId, id: sub._id },
      { onSuccess: () => toast.success("Deleted"), onError: () => toast.error("Delete failed") }
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(subs.length / ITEMS_PER_PAGE);
  const paginatedSubs = useMemo(
    () =>
      subs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [subs, currentPage]
  );

  // Stats
  const stats = {
    total: subs.length,
    active: subs.filter((s) => s.status === "active"|| s.status ==="pending").length,
    cancelled: subs.filter((s) => s.status === "cancelled").length,
    expired: subs.filter((s) => s.status === "expired").length,
  };

  return (
 <div className="p-6 max-w-7xl mx-auto">
  <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Subscription Dashboard</h1>

  {/* Stats Cards */}
  <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-300">
      <p className="text-gray-500 text-sm">Total Subscriptions</p>
      <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
    </div>
    <div className="p-4 bg-green-50 rounded-lg shadow hover:shadow-lg transition duration-300">
      <p className="text-gray-500 text-sm">Active</p>
      <p className="text-2xl font-semibold text-green-700">{stats.active}</p>
    </div>
    <div className="p-4 bg-yellow-50 rounded-lg shadow hover:shadow-lg transition duration-300">
      <p className="text-gray-500 text-sm">Cancelled</p>
      <p className="text-2xl font-semibold text-yellow-600">{stats.cancelled}</p>
    </div>
    <div className="p-4 bg-red-50 rounded-lg shadow hover:shadow-lg transition duration-300">
      <p className="text-gray-500 text-sm">Expired</p>
      <p className="text-2xl font-semibold text-red-600">{stats.expired}</p>
    </div>
  </div>

  {/* Add Button */}
  <div className="flex justify-end mb-4">
    <button
      onClick={() => { setShowModal(true); resetForm(); }}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-300"
    >
      <Plus size={18} /> Add Subscription
    </button>
  </div>

  {/* Table */}
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {["Plan", "Type", "Status", "Meals", "Start", "End", "Actions"].map((title) => (
            <th key={title} className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {isLoading ? (
          <tr><td colSpan={7} className="text-center py-6 text-gray-500">Loading...</td></tr>
        ) : paginatedSubs.length === 0 ? (
          <tr><td colSpan={7} className="text-center py-6 text-gray-500">No subscriptions found</td></tr>
        ) : (
          paginatedSubs.map((sub) => (
            <tr key={sub._id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3">{sub.planName}</td>
              <td className="px-4 py-3 capitalize">{sub.planType}</td>
              <td className={`px-4 py-3 font-semibold ${sub.status === "active" ? "text-green-600" : sub.status === "cancelled" ? "text-yellow-600" : "text-red-600"}`}>{sub.status}</td>
              <td className="px-4 py-3">{sub.remainingMeals}/{sub.totalMeals}</td>
              <td className="px-4 py-3">{new Date(sub.startDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">{new Date(sub.endDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => { setEditing(sub); setShowModal(true); setForm({ ...form, ...sub, ...sub.deliveryAddress }); setSelectedUserId(sub.userId); }}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sub)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition duration-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  {totalPages > 1 && (
    <div className="flex justify-center items-center mt-4 gap-2">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"} transition`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
      >
        Next
      </button>
    </div>
  )}

  {/* Modal */}
  {showModal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{editing ? "Edit Subscription" : "Add Subscription"}</h2>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        >
          <option value="">Select User</option>
          {usersLoading ? (
            <option disabled>Loading users...</option>
          ) : (
            users.map((user: IUser) => (
              <option key={user._id} value={user._id}>{user.username || user.email}</option>
            ))
          )}
        </select>

        <input
          type="text"
          value={form.planName}
          onChange={(e) => setForm({ ...form, planName: e.target.value })}
          placeholder="Plan Name"
          className="w-full border p-2 mb-3 rounded"
          required
        />

        <select
          value={form.planType}
          onChange={(e) => setForm({ ...form, planType: e.target.value as "basic" | "premium" | "pro" })}
          className="w-full border p-2 mb-3 rounded"
        >
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border p-2 rounded" required />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border p-2 rounded" required />
        </div>

        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} placeholder="Price" className="w-full border p-2 mb-3 rounded" required />

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{editing ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>
  )}
</div>

  );
}
