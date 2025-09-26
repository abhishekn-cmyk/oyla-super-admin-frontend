import { useState, useMemo } from "react";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import {
  useRestaurants,
//   useCreateRestaurant,
//   useUpdateRestaurant,
  useDeleteRestaurant,
  useAddProductToMenu,
  useAddProductToPopularMenu,
} from "../../hooks/useRestarunt";
import type { IRestaurant } from "../../types/restarunt";
import ProductModal from "../../components/ProductModal";
import RestaurantModal from "../../components/RestaruntModal";

export default function RestaurantPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [selectedRestaurant, setSelectedRestaurant] = useState<IRestaurant | null>(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState<{ restaurant: IRestaurant; type: "menu" | "popular" } | null>(null);

  const { data: restaurants = [], isLoading } = useRestaurants();
//   const createMutation = useCreateRestaurant();
//   const updateMutation = useUpdateRestaurant();
  const deleteMutation = useDeleteRestaurant();
  const addMenuMutation = useAddProductToMenu();
  const addPopularMutation = useAddProductToPopularMenu();

  // Filtered & paginated
  const filtered = useMemo(() => {
    if (!search) return restaurants;
    return restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [restaurants, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      {/* 4 Stats Cards */}
       <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Restaurants</p>
                <p className="text-3xl font-bold mt-2">{restaurants.length}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <FiPlus className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Menu Items</p>
                <p className="text-3xl font-bold mt-2">{restaurants.reduce((sum, r) => sum + r.menu.length, 0)}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <FiEdit className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Popular Items</p>
                <p className="text-3xl font-bold mt-2">{restaurants.reduce((sum, r) => sum + r.popularMenu.length, 0)}</p>
              </div>
              <div className="bg-pink-400 bg-opacity-30 p-3 rounded-full">
                <FiPlus className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">
                  {(restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / (restaurants.length || 1)).toFixed(1)}
                </p>
              </div>
              <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-full">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

      {/* Search + Add */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { setSelectedRestaurant(null); setShowRestaurantModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          <FiPlus /> Add Restaurant
        </button>
      </div>

      {/* Restaurant Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow mt-4">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Menu Items</th>
              <th className="px-4 py-3">Popular Items</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(r => (
              <tr key={r._id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.description}</td>
               <td className="px-4 py-3">
                                <img 
                                    src={`${import.meta.env.VITE_API_URL}/${r.image}`} 
                                    alt={r.name || "Restaurant Image"} 
                                    className="w-20 h-20 object-cover rounded"
                                />
                                </td>

                <td className="px-4 py-3">{r.menu.length}</td>
                <td className="px-4 py-3">{r.popularMenu.length}</td>
                <td className="px-4 py-3">{r.rating || 0}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setSelectedRestaurant(r); setShowRestaurantModal(true); }} className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"><FiEdit /></button>
                  <button onClick={() => deleteMutation.mutate(r._id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiTrash /></button>
                  <button onClick={() => setShowProductModal({ restaurant: r, type: "menu" })} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Add Menu</button>
                  <button onClick={() => setShowProductModal({ restaurant: r, type: "popular" })} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Popular</button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">No restaurants found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Modals */}
      {showRestaurantModal && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setShowRestaurantModal(false)}
        />
      )}
      {showProductModal && (
        <ProductModal
          restaurant={showProductModal.restaurant}
          type={showProductModal.type}
          onAdd={showProductModal.type === "menu" ? addMenuMutation.mutateAsync : addPopularMutation.mutateAsync}
          onClose={() => setShowProductModal(null)}
        />
      )}
    </div>
  );
}
