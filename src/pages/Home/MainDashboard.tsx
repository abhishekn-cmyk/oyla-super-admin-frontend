// pages/MainDashboard.tsx
import { useState } from "react";
import Home from "./Home";
import Dashboard from "./Dashboard";

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState<"home" | "charts">("home");

  return (
    <div className="bg-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 transition ${
            activeTab === "home" ? "border-blue-500 text-blue-600" : "border-transparent hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("home")}
        >
          Home Stats
        </button>
        <button
          className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 transition ${
            activeTab === "charts" ? "border-blue-500 text-blue-600" : "border-transparent hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "home" && <Home />}
        {activeTab === "charts" && <Dashboard />}
      </div>

      {/* Optional: Next / Previous Buttons */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setActiveTab(activeTab === "charts" ? "home" : "home")}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setActiveTab(activeTab === "home" ? "charts" : "charts")}
        >
          Next
        </button>
      </div>
    </div>
  );
}
