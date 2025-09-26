import { useEffect, useState } from "react";
import {
  getAllCarousels,
  createCarousel,
  updateCarousel,
  deleteCarousel,
  type CarouselType,
} from "../../services/carousel";
import { Plus } from "lucide-react";

const ITEMS_PER_PAGE = 6;

export default function CarouselAdmin() {
  const [carousels, setCarousels] = useState<CarouselType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<CarouselType>>({});
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const data = await getAllCarousels();
      setCarousels(data);
    } catch (err) {
      console.error("Error fetching carousels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (carousel?: CarouselType) => {
    if (carousel) {
      setForm(carousel);
      setEditingId(carousel._id);
    } else {
      setForm({});
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (form.title) formData.append("title", form.title);
      if (form.subtitle) formData.append("subtitle", form.subtitle);
      if (form.link) formData.append("link", form.link);
      formData.append("isActive", String(form.isActive ?? true));
      formData.append("order", String(form.order ?? 0));
      if (file) formData.append("image", file);

      if (editingId) await updateCarousel(editingId, formData);
      else await createCarousel(formData);

      setShowModal(false);
      setForm({});
      setFile(null);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Error saving carousel", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carousel?")) return;
    await deleteCarousel(id);
    fetchData();
  };

  const totalPages = Math.ceil(carousels.length / ITEMS_PER_PAGE);
  const paginated = carousels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carousel Management</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Carousel
        </button>
      </div>

      {/* Cards Row */}
 <div className="grid grid-cols-4 gap-4 mb-6">
  {/* Total Carousels */}
  <div className="bg-blue-600 text-white rounded-xl shadow p-4 flex flex-col justify-center items-center hover:shadow-lg transition h-40">
    <h3 className="text-2xl font-bold">{carousels.length}</h3>
    <p className="text-sm mt-2">Total Carousels</p>
  </div>

  {/* Total Orders */}
  <div className="bg-green-600 text-white rounded-xl shadow p-4 flex flex-col justify-center items-center hover:shadow-lg transition h-40">
    <h3 className="text-2xl font-bold">
      {carousels.reduce((sum, c) => sum + (c.order ?? 0), 0)}
    </h3>
    <p className="text-sm mt-2">Total Order Count</p>
  </div>

  {/* Active Carousels */}
  <div className="bg-yellow-500 text-white rounded-xl shadow p-4 flex flex-col justify-center items-center hover:shadow-lg transition h-40">
    <h3 className="text-2xl font-bold">
      {carousels.filter((c) => c.isActive).length}
    </h3>
    <p className="text-sm mt-2">Active Carousels</p>
  </div>

  {/* Sample Carousel Image */}
  <div className="bg-gray-100 rounded-xl shadow p-4 flex flex-col justify-center items-center hover:shadow-lg transition h-40">
    {carousels[0]?.image && (
      <img
       src={`${import.meta.env.VITE_API_URL}/${carousels[0]?.image}`}
        alt={carousels[0].title}
        className="w-16 h-16 object-cover rounded mb-2"
      />
    )}
    <h3 className="text-xl font-bold">{carousels[0]?.title || "Sample"}</h3>
    <p className="text-sm mt-1">First Carousel</p>
  </div>
</div>



      {/* Table */}
      <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Subtitle</th>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map((c, idx) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                </td>
                <td className="px-4 py-2">
                  {c.image && (
                   
                    <img
                            src={`${import.meta.env.VITE_API_URL}/${carousels[0]?.image}`}
                            alt={carousels[0]?.title}
                            className="w-16 h-16 object-cover rounded mb-2"
                          />

                     
                  )}
                </td>
                <td className="px-4 py-2 font-medium">{c.title}</td>
                <td className="px-4 py-2">{c.subtitle}</td>
                <td className="px-4 py-2">{c.order}</td>
                <td className="px-4 py-2">
                  {c.isActive ? (
                    <span className="text-green-600 font-semibold">✅</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌</span>
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => openModal(c)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No carousels found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end gap-2 p-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Carousel" : "Add Carousel"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={form.subtitle ?? ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Link"
                value={form.link ?? ""}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="border rounded p-2"
              />
              <input
                type="number"
                placeholder="Order"
                value={form.order ?? 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="border rounded p-2"
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="border rounded p-2"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
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
