import { useState } from "react";
import { useLanguages, useCreateLanguage, useUpdateLanguage, useDeleteLanguage } from "../../hooks/useLanguage";
import type { LanguageType } from "../../types/language";

const ITEMS_PER_PAGE = 5;

export default function LanguageAdmin() {
  const { data: languages = [], isLoading } = useLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", proficiency: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const openModal = (lang?: LanguageType) => {
    if (lang) {
      setEditingId(lang._id);
      setForm({ name: lang.name, proficiency: lang.proficiency });
    } else {
      setEditingId(null);
      setForm({ name: "", proficiency: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this language?")) deleteMutation.mutate(id);
  };

  // Pagination
  const totalPages = Math.ceil(languages.length / ITEMS_PER_PAGE);
  const paginated = languages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) return <p className="p-6 text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Languages</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add Language
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-5 rounded-xl shadow flex flex-col items-center justify-center h-40 hover:shadow-2xl transform hover:-translate-y-1 transition">
          <h2 className="text-2xl md:text-3xl font-bold">{languages.length}</h2>
          <span>Total Languages</span>
        </div>
        <div className="bg-green-600 text-white p-5 rounded-xl shadow flex flex-col items-center justify-center h-40 hover:shadow-2xl transform hover:-translate-y-1 transition">
          <h2 className="text-2xl md:text-3xl font-bold">{languages.filter(l => l.proficiency === "Beginner").length}</h2>
          <span>Beginner Level</span>
        </div>
        <div className="bg-yellow-500 text-white p-5 rounded-xl shadow flex flex-col items-center justify-center h-40 hover:shadow-2xl transform hover:-translate-y-1 transition">
          <h2 className="text-2xl md:text-3xl font-bold">{languages.filter(l => l.proficiency !== "Beginner").length}</h2>
          <span>Other Levels</span>
        </div>
        <div className="bg-gray-700 text-white p-5 rounded-xl shadow flex flex-col items-center justify-center h-40 hover:shadow-2xl transform hover:-translate-y-1 transition">
          <h2 className="text-2xl md:text-3xl font-bold">{languages[languages.length - 1]?.name || "N/A"}</h2>
          <span>Latest Added</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Proficiency</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map((lang, idx) => (
              <tr key={lang._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                <td className="px-4 py-2 text-sm">{lang.name}</td>
                <td className="px-4 py-2 text-sm">{lang.proficiency}</td>
                <td className="px-4 py-2 text-sm">{new Date(lang.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => openModal(lang)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lang._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No languages found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-wrap justify-end gap-2 p-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md transform transition-all scale-95 animate-scaleIn">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Language" : "Add Language"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Proficiency"
                value={form.proficiency}
                onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
