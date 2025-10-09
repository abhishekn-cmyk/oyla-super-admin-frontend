import { useState } from "react";
import {
  useGetAllPrivacyPolicies,
  useCreatePrivacyPolicy,
  useUpdatePrivacyPolicy,
  useDeletePrivacyPolicy,
} from "../../hooks/usePrivacy";
import type { PrivacyPolicy } from "../../types/privacy";
import { toast } from "react-toastify";

export default function PrivacyCompact() {
  const [newPolicy, setNewPolicy] = useState<PrivacyPolicy>({ title: "", content: "" });
  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 2;

  const { data: policies = [] } = useGetAllPrivacyPolicies();
  const createPolicy = useCreatePrivacyPolicy({ onSuccess: () => toast.success("Policy created!") });
  const updatePolicy = useUpdatePrivacyPolicy({ onSuccess: () => setEditingPolicy(null) });
  const deletePolicy = useDeletePrivacyPolicy();

  const handleCreate = () => {
    if (!newPolicy.title || !newPolicy.content) return toast.error("Title and Content are required");
    createPolicy.mutate(newPolicy);
    setNewPolicy({ title: "", content: "" });
  };

  const handleUpdate = () => {
    if (editingPolicy && editingPolicy._id) {
      if (!editingPolicy.title || !editingPolicy.content) return toast.error("Title and Content required");
      updatePolicy.mutate({ policyId: editingPolicy._id, data: editingPolicy });
    }
  };

  const totalPages = Math.ceil(policies.length / policiesPerPage);
  const startIndex = (currentPage - 1) * policiesPerPage;
  const endIndex = startIndex + policiesPerPage;
  const currentPolicies = policies.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Create Policy */}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Title"
          value={newPolicy.title}
          onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
          className="border p-2 rounded flex-1"
        />
       <textarea
  placeholder="Content"
  value={newPolicy.content}
  onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
  className="border p-2 rounded flex-2 resize-none h-20"
/>

        <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
          Add
        </button>
      </div>

      {/* List Policies */}
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {currentPolicies.map((policy) => (
          <div key={policy._id} className="flex items-center justify-between border p-2 rounded hover:bg-gray-50">
            <div className="truncate">
              <strong>{policy.title}:</strong> <span className="text-sm">{policy.content}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingPolicy(policy)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deletePolicy.mutate(policy._id!)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-1 justify-end text-sm">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-2 py-1 border rounded disabled:opacity-50">
          Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-2 py-1 border rounded ${currentPage === idx + 1 ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            {idx + 1}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-2 py-1 border rounded disabled:opacity-50">
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded p-4 w-full max-w-md space-y-2">
            <input
              type="text"
              value={editingPolicy.title}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              value={editingPolicy.content}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingPolicy(null)} className="px-3 py-1 rounded border">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
