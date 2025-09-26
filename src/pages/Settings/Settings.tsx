import { useState } from "react";
import { FiUser, FiLock, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  useUpdateProfile,
  useUpdatePassword,
  type SuperAdminProfile,
  type UpdatePassword,
} from "../../hooks/useSuperadmin";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // --- Profile form ---
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } =
    useForm<SuperAdminProfile>();
  const { mutate: updateProfile, isPending: isProfileUpdating } = useUpdateProfile({
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      localStorage.setItem("superadmin", JSON.stringify(data));
      resetProfile(data);
    },
    onError: (err: any) => toast.error(err.message || "Error updating profile"),
  });

  // --- Password form ---
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } =
    useForm<UpdatePassword>();
  const { mutate: updatePassword, isPending: isPasswordUpdating } = useUpdatePassword({
    onSuccess: () => {
      toast.success("Password updated successfully!");
      resetPassword();
    },
    onError: (err: any) => toast.error(err.message || "Error updating password"),
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("superadmin");
    localStorage.removeItem("token");
    
    window.location.href = "/login";
  };

  const handleNext = () => setActiveTab(activeTab === "profile" ? "password" : "profile");
  const handlePrev = () => setActiveTab(activeTab === "password" ? "profile" : "password");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          <FiLogOut size={20} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiUser /> Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === "password"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiLock /> Update Password
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 rounded-lg shadow-sm relative">
        {activeTab === "profile" && (
          <form
            onSubmit={handleSubmitProfile((data) => updateProfile(data))}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                {...registerProfile("username")}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...registerProfile("email")}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <input type="file" {...registerProfile("profileImage")} className="mt-1 block w-full" />
            </div>

            <div className="flex justify-between items-center">
              <div></div>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Next <FiChevronRight />
              </button>
            </div>

            <button
              type="submit"
              disabled={isProfileUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
            >
              {isProfileUpdating ? "Updating..." : "Update Profile"}
            </button>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handleSubmitPassword((data) => updatePassword(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                {...registerPassword("oldPassword")}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                {...registerPassword("newPassword")}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                type="submit"
                disabled={isPasswordUpdating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPasswordUpdating ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
