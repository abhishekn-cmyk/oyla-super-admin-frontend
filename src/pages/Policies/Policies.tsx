import { useState, useEffect } from "react";
import {
  useSuperAdminPolicies,
  useUpdateSuperAdminPolicies,
} from "../../hooks/useSuperadmin";
import {toast} from "react-toastify";

type Tab = "terms" | "privacyPolicy" | "renewalRules";
const tabs: Tab[] = ["terms", "privacyPolicy", "renewalRules"];

export default function Policies() {
  const adminSid = localStorage.getItem("superadmin");
  const adminId = adminSid ? JSON.parse(adminSid)._id : "";

  const { data: policies, isLoading } = useSuperAdminPolicies(adminId);
  const updateMutation = useUpdateSuperAdminPolicies();

  const [activeTab, setActiveTab] = useState<Tab>("terms");
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    terms: "",
    privacyPolicy: "",
    renewalRules: "",
  });

  // Clear form on page load
  useEffect(() => {
    setForm({ terms: "", privacyPolicy: "", renewalRules: "" });
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --- SAVE ---
  const handleSave = (callback?: () => void) => {
    if (!adminId) {
      toast.error("Admin ID missing. Please log in again.");
      return;
    }

    setIsSaving(true);
    updateMutation.mutate(
      { id: adminId, policies: form },
      {
        onSuccess: () => {
          setIsSaving(false);
          toast.success("✅ Policies saved successfully!");
          if (callback) callback();
        },
        onError: () => {
          setIsSaving(false);
          toast.error("❌ Failed to save policies. Try again.");
        },
      }
    );
  };

  // --- TABS ---
  const handlePrev = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    handleSave(() => setActiveTab(tabs[prevIndex]));
  };

  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    handleSave(() => setActiveTab(tabs[nextIndex]));
  };

  // --- LOAD EXISTING POLICIES ---
  const handleLoadPolicies = () => {
    if (policies) {
      setForm({
        terms: policies.terms || "",
        privacyPolicy: policies.privacyPolicy || "",
        renewalRules: policies.renewalRules || "",
      });
      toast.success("✅ Loaded saved policies.");
    } else {
      toast.error("No saved policies found.");
    }
  };

  // --- RESET FORM ---
  const handleReset = () => {
    setForm({ terms: "", privacyPolicy: "", renewalRules: "" });
    toast("🧹 Cleared all fields.");
  };

  if (isLoading) return <div>Loading policies...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SuperAdmin Policies</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "terms"
              ? "Terms & Conditions"
              : tab === "privacyPolicy"
              ? "Privacy Policy"
              : "Renewal Rules"}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          value={form[activeTab]}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          rows={10}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder={`Enter ${activeTab.replace(/([A-Z])/g, " $1")}...`}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between mb-4">
        <button
          onClick={handlePrev}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={activeTab === "renewalRules"}
        >
          Next
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Reset
        </button>

        <button
          onClick={handleLoadPolicies}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Load Policies
        </button>

        <button
          onClick={() => handleSave()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}



