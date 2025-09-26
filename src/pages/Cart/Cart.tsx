// Cart.tsx
import { useMemo, useState } from "react";
import { useGetFullCart } from "../../hooks/useCart";
import { FiSearch, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default function Cart() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { data: cart = [], isLoading, isError } = useGetFullCart();

  // Flatten cart items safely
  const flattenedCartItems = useMemo(() => {
    return cart.flatMap(c =>
      c.items.map(item => ({
        cartId: c.cartId,
        user: {
          _id: c.user._id,
          username: c.user.username || c.user.email || "Unknown",
          email: c.user.email || "-",
          role: c.user.role || "-",
        },
        quantity: item.quantity,
        product: {
          _id: item.product._id,
          name: item.product.name || "-",
          price: item.product.price || 0,
        },
        restaurant: item.restaurant || null,
        program: item.program || null,
        totalPrice: (item.product.price || 0) * item.quantity,
      }))
    );
  }, [cart]);

  // Search filter
  const filteredCart = useMemo(() => {
    if (!search) return flattenedCartItems;
    return flattenedCartItems.filter(item =>
      item.user.username.toLowerCase().includes(search.toLowerCase()) ||
      item.user.email.toLowerCase().includes(search.toLowerCase()) ||
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.program?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [flattenedCartItems, search]);

  // Pagination
  const paginatedCart = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredCart.slice(start, start + rowsPerPage);
  }, [filteredCart, page]);

  const totalPages = Math.ceil(filteredCart.length / rowsPerPage);

  // Export helpers
  const exportData = filteredCart.map(item => ({
    User: item.user.username,
    Email: item.user.email,
    Product: item.product.name,
    Quantity: item.quantity,
    Price: item.product.price,
    Total: item.totalPrice,
    Restaurant: item.restaurant?.name || "-",
    Program: item.program?.title || "-",
  }));

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "cart-details.csv");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CartDetails");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "cart-details.xlsx");
  };

  if (isLoading) return <p className="p-4">Loading cart...</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load cart</p>;

  return (
    <div className="p-6 space-y-6">
   <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total Carts */}
  <div className="bg-blue-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
    <p className="text-lg font-semibold">Total Carts</p>
    <p className="text-3xl font-bold">{cart.length}</p>
  </div>

  {/* Total Items */}
  <div className="bg-green-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
    <p className="text-lg font-semibold">Total Items</p>
    <p className="text-3xl font-bold">
      {flattenedCartItems.reduce((sum, item) => sum + item.quantity, 0)}
    </p>
  </div>

  {/* Unique Products */}
  <div className="bg-pink-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
    <p className="text-lg font-semibold">Unique Products</p>
    <p className="text-3xl font-bold">
      {new Set(flattenedCartItems.map((item) => item.product._id)).size}
    </p>
  </div>

  {/* Revenue */}
  <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
    <p className="text-lg font-semibold">Revenue</p>
    <p className="text-3xl font-bold">
      ₹{flattenedCartItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
    </p>
  </div>
</div>

      {/* Search + Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Cart Details</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user/product/restaurant/program..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition">
              <FiDownload /> CSV
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition">
              <FiDownload /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Program</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCart.map(item => (
              <tr key={`${item.cartId}-${item.product._id}`} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{item.user.username}</td>
                <td className="px-4 py-3">{item.user.email}</td>
                <td className="px-4 py-3">{item.product.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">₹{item.product.price}</td>
                <td className="px-4 py-3 font-semibold">₹{item.totalPrice.toLocaleString()}</td>
                <td className="px-4 py-3">
                                {item.restaurant?.name ? item.restaurant.name.replace(/^"|"$/g, "") : "-"}
                                </td>

                <td className="px-4 py-3">{item.program?.title || "-"}</td>
              </tr>
            ))}
            {paginatedCart.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
