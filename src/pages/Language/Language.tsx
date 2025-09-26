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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Languages</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Language
        </button>
      </div>

      {/* Cards */}
      {/* Cards */}
<div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-blue-600 text-white p-4 rounded shadow flex flex-col items-center justify-center h-40 hover:shadow-lg transition">
    <h2 className="text-2xl font-bold">{languages.length}</h2>
    <span>Total Languages</span>
  </div>
  <div className="bg-green-600 text-white p-4 rounded shadow flex flex-col items-center justify-center h-40 hover:shadow-lg transition">
    <h2 className="text-2xl font-bold">{languages.filter(l => l.proficiency === "Beginner").length}</h2>
    <span>Beginner Level</span>
  </div>
  <div className="bg-yellow-500 text-white p-4 rounded shadow flex flex-col items-center justify-center h-40 hover:shadow-lg transition">
    <h2 className="text-2xl font-bold">{languages.filter(l => l.proficiency !== "Beginner").length}</h2>
    <span>Other Levels</span>
  </div>
  <div className="bg-gray-700 text-white p-4 rounded shadow flex flex-col items-center justify-center h-40 hover:shadow-lg transition">
    <h2 className="text-2xl font-bold">{languages[languages.length - 1]?.name || "N/A"}</h2>
    <span>Latest Added</span>
  </div>
</div>


      {/* Table */}
      <div className="overflow-x-auto border rounded shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Proficiency</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map((lang, idx) => (
              <tr key={lang._id}>
                <td className="px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                <td className="px-4 py-2">{lang.name}</td>
                <td className="px-4 py-2">{lang.proficiency}</td>
                <td className="px-4 py-2">{new Date(lang.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => openModal(lang)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lang._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
        <div className="flex justify-end gap-2 p-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Language" : "Add Language"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Proficiency"
                value={form.proficiency}
                onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                className="border rounded p-2"
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
