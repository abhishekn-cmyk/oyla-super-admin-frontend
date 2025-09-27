import { useState } from "react";
import {
  useGetFreezes,
  useAddFreeze,
  useUpdateFreeze,
  useDeleteFreeze,
} from "../../hooks/useFreeze";
import { useUsers } from "../../hooks/user";
import { useProducts } from "../../hooks/useProduct";
import type { Freeze } from "../../types/freeze";
import { toast } from "react-toastify";

export default function FreezeManager() {
  const [userId, setUserId] = useState<string>("");
  const [newFreeze, setNewFreeze] = useState<Freeze>({
    userId: "",
    productId: "",
    freezeDate: "",
    meals: [],
  });
  const [editingFreeze, setEditingFreeze] = useState<Freeze | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 4;
  const [loading, setLoading] = useState(false);

  const { users = [] } = useUsers();
  const { data: products = [] } = useProducts();
  const { data: freezes = [] } = useGetFreezes();
  const addFreeze = useAddFreeze();
  const updateFreeze = useUpdateFreeze();
  const deleteFreeze = useDeleteFreeze();

  const handleAdd = () => {
    if (!userId || !newFreeze.productId || !newFreeze.freezeDate)
      return toast.error("User, Product and Date are required");

    addFreeze.mutate({ userId, freeze: newFreeze });
    setNewFreeze({ userId: "", productId: "", freezeDate: "", meals: [] });
    setLoading(true);
  };

  const handleUpdate = () => {
    if (editingFreeze?._id) {
      updateFreeze.mutate({
        freezeId: editingFreeze._id,
        userId:
          typeof editingFreeze.userId === "object"
            ? editingFreeze.userId._id
            : editingFreeze.userId,
        updates: {
          ...editingFreeze,
          productId:
            typeof editingFreeze.productId === "object"
              ? editingFreeze.productId._id
              : editingFreeze.productId,
        },
      });
      setEditingFreeze(null);
      setLoading(true);
    }
  };

  const handleDelete = (freezeId: string) => {
    if (confirm("Delete this freeze?")) deleteFreeze.mutate({ freezeId, userId });
  };

  const paginatedFreezes = freezes.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(freezes.length / perPage);

  return (
    <div className="bg-gray-50">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Manage Freezes</h1>

      {/* Add Freeze */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Freeze</h2>

        {/* User Dropdown */}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700">Select User:</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border rounded-lg p-2 w-full mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Product Dropdown */}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700">Select Product:</label>
          <select
            value={newFreeze.productId.toString()}
            onChange={(e) => setNewFreeze({ ...newFreeze, productId: e.target.value })}
            className="border rounded-lg p-2 w-full mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Product --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Freeze Date */}
        <input
          type="date"
          value={newFreeze.freezeDate}
          onChange={(e) => setNewFreeze({ ...newFreeze, freezeDate: e.target.value })}
          className="border rounded p-2 w-full mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Add Freeze
        </button>
      </div>

      {/* Freezes List */}
      {loading ? (
        <p>Loading freezes...</p>
      ) : paginatedFreezes.length === 0 ? (
        <p className="text-gray-500">No freezes found.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedFreezes.map((freeze) => (
              <div
                key={freeze._id}
                className="bg-white p-4 rounded-xl shadow-md border flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <p>
                  <strong>Product:</strong>{" "}
                  {typeof freeze.productId === "object" ? freeze.productId.name : freeze.productId}
                </p>
                <p>
                  <strong>Date:</strong> {freeze.freezeDate}
                </p>
                <p>
                  <strong>Status:</strong> {freeze.status || "active"}
                </p>
                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    onClick={() => setEditingFreeze(freeze)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(freeze._id!)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-6 gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-700">Page {page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingFreeze && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg transform transition-all scale-95 animate-scaleIn">
            <h3 className="text-xl font-semibold mb-4">Edit Freeze</h3>

            {/* User */}
            <label className="block mb-1 font-medium text-gray-700">Select User:</label>
            <select
              value={typeof editingFreeze.userId === "object" ? editingFreeze.userId._id : editingFreeze.userId}
              onChange={(e) =>
                setEditingFreeze({ ...editingFreeze, userId: e.target.value })
              }
              className="border rounded-lg p-2 w-full mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username || user.email}
                </option>
              ))}
            </select>

            {/* Product */}
            <label className="block mb-1 font-medium text-gray-700">Select Product:</label>
            <select
              value={
                typeof editingFreeze.productId === "object"
                  ? editingFreeze.productId._id
                  : editingFreeze.productId
              }
              onChange={(e) =>
                setEditingFreeze({ ...editingFreeze, productId: e.target.value })
              }
              className="border rounded-lg p-2 w-full mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>

            {/* Freeze Date */}
            <input
              type="date"
              value={editingFreeze.freezeDate}
              onChange={(e) =>
                setEditingFreeze({ ...editingFreeze, freezeDate: e.target.value })
              }
              className="border rounded p-2 w-full mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="flex justify-end mt-2 gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingFreeze(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
