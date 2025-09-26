// pages/Users/Users.tsx
import { useUsers } from "../../hooks/user";
import { type IUser } from "../../types/user";
import { FiMail, FiPhone, FiUsers, FiX, FiSearch } from "react-icons/fi";
import { useState, useMemo } from "react";

export default function Users() {
  const { users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.mobileNumber &&
          user.profile.mobileNumber.includes(searchTerm))
    );
  }, [users, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleView = (user: IUser) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);
  const handlePageChange = (page: number) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <p className="text-gray-600 animate-pulse">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white p-6 rounded-2xl shadow border text-center">
          <FiUsers className="text-red-500 w-10 h-10 mx-auto mb-3" />
          <h2 className="font-semibold text-red-600">Error loading users</h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and view all system users</p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-200">
          {/* Table Header with Search */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">All Users</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                  <th className="w-32 px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">
                        {user.username}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {user.profile?.mobileNumber || "Not provided"}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleView(user)}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      <FiUsers className="mx-auto mb-2 text-gray-400 w-6 h-6" />
                      {searchTerm ? "No users found" : "No users available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Inside Table Footer */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 px-4 py-3 border-t border-gray-200">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-lg border text-sm ${
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
        </div>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative mx-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.username}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiPhone className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium">
                    {selectedUser.profile?.mobileNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {selectedUser.profile?.dob || "Not provided"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">
                    {selectedUser.profile?.gender || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {selectedUser.profile?.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
