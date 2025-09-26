// ----------------- Rewards.tsx -----------------
import { useState, useMemo } from "react";
import { FiSearch, FiX, FiPlus } from "react-icons/fi";
import {
  useGetAllRewards,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from "../../hooks/useReward";
import { useUsers } from "../../hooks/user"; // Fetch all users
import type { IReward } from "../../types/rewards";
import type { IUser } from "../../types/user";

export default function Rewards() {
  const { data: rewards = [], isLoading } = useGetAllRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();
  const {  users = [] } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rewardsPerPage = 8;

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rewards;
    return rewards.filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rewards, searchTerm]);

  const indexOfLast = currentPage * rewardsPerPage;
  const indexOfFirst = indexOfLast - rewardsPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / rewardsPerPage);

  const openCreateModal = () => {
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: IReward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReward(null);
    setIsModalOpen(false);
  };

  if (isLoading) return <p className="p-6">Loading rewards...</p>;

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Rewards Management</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FiPlus /> Create Reward
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rewards..."
            className="pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr className="text-center">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Value</th>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Expiry</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 text-left">Redeemed Users</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((reward, idx) => (
              <tr key={reward._id} className="hover:bg-gray-50 text-center">
                <td className="px-4 py-2">{indexOfFirst + idx + 1}</td>
                <td className="px-4 py-2 text-left">{reward.title}</td>
                <td className="px-4 py-2 text-left">{reward.description}</td>
                <td className="px-4 py-2">{reward.type}</td>
                <td className="px-4 py-2">{reward.value}</td>
                <td className="px-4 py-2">{reward.code}</td>
                <td className="px-4 py-2">{reward.expiryDate ? new Date(reward.expiryDate).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2">{reward.isActive ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  {reward.redeemedUsers?.length ? (
                    <span title={reward.redeemedUsers.join(", ")} className="cursor-help">
                      {reward.redeemedUsers.length} user(s)
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openEditModal(reward)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(reward._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-gray-500">
                  No rewards found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <RewardModal
          reward={selectedReward}
          onClose={closeModal}
          createMutation={createMutation}
          updateMutation={updateMutation}
          users={users}
        />
      )}
    </div>
  );
}

// ----------------- RewardModal.tsx -----------------
interface RewardModalProps {
  reward: IReward | null;
  onClose: () => void;
  createMutation: ReturnType<typeof useCreateReward>;
  updateMutation: ReturnType<typeof useUpdateReward>;
  users: IUser[];
}

function RewardModal({ reward, onClose, createMutation, updateMutation, users }: RewardModalProps) {
  const [title, setTitle] = useState(reward?.title || "");
  const [description, setDescription] = useState(reward?.description || "");
  const [type, setType] = useState<"percentage" | "fixed" | "points">(reward?.type || "percentage");
  const [value, setValue] = useState(reward?.value || 0);
  const [code, setCode] = useState(reward?.code || "");
  const [expiryDate, setExpiryDate] = useState(reward?.expiryDate ? reward.expiryDate.split("T")[0] : "");
  const [isActive, setIsActive] = useState(reward?.isActive ?? true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(reward?.users || []);

  const handleSubmit = () => {
    const payload = {
      title,
      description,
      type,
      value,
      code,
      expiryDate,
      isActive,
      users: selectedUsers,
    };
    if (reward) {
      updateMutation.mutate({ id: reward._id, reward: payload });
    } else {
      createMutation.mutate(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
        <h3 className="text-xl font-semibold mb-4">{reward ? "Edit Reward" : "Create Reward"}</h3>
        <div className="space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border rounded" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border rounded">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="points">Points</option>
          </select>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} placeholder="Value" className="w-full px-3 py-2 border rounded" />
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className="w-full px-3 py-2 border rounded" />
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
         <label className="block">Assign User:</label>
<select
  value={selectedUsers[0] || ""} // take first selected or empty
  onChange={(e) => setSelectedUsers([e.target.value])} // wrap in array for backend
  className="w-full px-3 py-2 border rounded"
>
  <option value="">Select a user</option>
  {users.map(u => (
    <option key={u._id} value={u._id}>
      {u.username || u.email}
    </option>
  ))}
</select>

          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {reward ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
