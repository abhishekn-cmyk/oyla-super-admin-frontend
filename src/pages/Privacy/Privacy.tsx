import { useState } from "react";
import {
  useGetAllPrivacyPolicies,
  useCreatePrivacyPolicy,
  useUpdatePrivacyPolicy,
  useDeletePrivacyPolicy,
} from "../../hooks/usePrivacy";
import type { PrivacyPolicy } from "../../types/privacy";
import { toast } from "react-toastify";

export default function Privacy() {
  const [newPolicy, setNewPolicy] = useState<PrivacyPolicy>({ title: "", content: "" });
  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 2;

  const { data: policies = [] } = useGetAllPrivacyPolicies();
  const createPolicy = useCreatePrivacyPolicy({
    onSuccess: () => toast.success("Privacy policy created!"),
  });
  const updatePolicy = useUpdatePrivacyPolicy({
    onSuccess: () => {
      toast.success("Privacy policy updated!");
      setEditingPolicy(null);
    },
  });
  const deletePolicy = useDeletePrivacyPolicy();

  const handleCreate = () => {
    if (!newPolicy.title || !newPolicy.content) return toast.error("Title and Content are required");
    createPolicy.mutate(newPolicy);
    setNewPolicy({ title: "", content: "" });
  };

  const handleUpdate = () => {
    if (editingPolicy) {
      if (!editingPolicy.title || !editingPolicy.content)
        return toast.error("Title and Content are required");
      updatePolicy.mutate({ policyId: editingPolicy._id!, data: editingPolicy });
    }
  };

  // Pagination
  const totalPages = Math.ceil(policies.length / policiesPerPage);
  const startIndex = (currentPage - 1) * policiesPerPage;
  const endIndex = startIndex + policiesPerPage;
  const currentPolicies = policies.slice(startIndex, endIndex);

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policies</h1>

      {/* Create Policy */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Policy</h2>
        <input
          type="text"
          placeholder="Title"
          value={newPolicy.title}
          onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <textarea
          placeholder="Content"
          value={newPolicy.content}
          onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto"
        >
          Create Privacy Policy
        </button>
      </div>

      {/* Existing Policies */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Existing Policies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {currentPolicies.map((policy) => (
          <div
            key={policy._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{policy.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-4">{policy.content}</p>
            </div>
            <div className="mt-4 flex justify-end gap-2 flex-wrap">
              <button
                onClick={() => setEditingPolicy(policy)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm flex-1 sm:flex-auto"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this policy?")) {
                    deletePolicy.mutate(policy._id!);
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex-1 sm:flex-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === idx + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">Edit Policy</h3>
            <input
              type="text"
              placeholder="Title"
              value={editingPolicy.title}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Content"
              value={editingPolicy.content}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <button
                onClick={() => setEditingPolicy(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex-1 sm:flex-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-auto"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
