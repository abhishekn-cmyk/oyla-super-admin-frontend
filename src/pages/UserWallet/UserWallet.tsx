import { useState, useMemo } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useWalletHistories } from "../../hooks/useWallet";

export default function UserWallet() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { data: histories = [], isLoading, isError } = useWalletHistories();

  // Filter + Search
  const filteredHistories = useMemo(() => {
    if (!search) return histories;
    return histories.filter(h =>
     
      h.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      (h.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [histories, search]);

  // Pagination
  const paginatedHistories = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredHistories.slice(start, start + rowsPerPage);
  }, [filteredHistories, page]);

  const totalPages = Math.ceil(filteredHistories.length / rowsPerPage);

  // Export CSV / Excel
  const exportData = filteredHistories.map(h => ({
    Name: h.userId.username,
    Email: h.userId.email,
    Amount: h.amount,
    Type: h.type,
    WalletBalance: h.walletId.balance,
    Currency: h.walletId.currency,
    Date: new Date(h.transactionDate).toLocaleString(),
    Description: h.description || "-",
  }));

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "wallet_histories.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WalletHistories");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "wallet_histories.xlsx");
  };

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load data</p>;

  // Summary Cards
  const totalUsers = new Set(histories.map(h => h.userId._id)).size;
  const totalTransactions = histories.length;
  const totalBalance = histories.reduce((sum, h) => sum + h.walletId.balance, 0);
  const totalCredit = histories.filter(h => h.type === "credit").reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <p className="text-lg font-semibold">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <p className="text-lg font-semibold">Total Transactions</p>
          <p className="text-3xl font-bold">{totalTransactions}</p>
        </div>
        <div className="bg-pink-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <p className="text-lg font-semibold">Total Balance</p>
          <p className="text-3xl font-bold">₹{totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <p className="text-lg font-semibold">Total Credit</p>
          <p className="text-3xl font-bold">₹{totalCredit.toLocaleString()}</p>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Wallet Histories</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user/email/desc..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
            >
              <FiDownload /> CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
            >
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
             
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Wallet Balance</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistories.map(h => (
              <tr key={h._id} className="border-b hover:bg-gray-50 transition">
                
                <td className="px-4 py-3">{h.userId.email}</td>
                <td className="px-4 py-3">₹{h.amount}</td>
                <td className="px-4 py-3 capitalize">{h.type}</td>
                <td className="px-4 py-3">₹{h.walletId.balance}</td>
                <td className="px-4 py-3">{h.walletId.currency}</td>
                <td className="px-4 py-3">{new Date(h.transactionDate).toLocaleString()}</td>
                <td className="px-4 py-3">{h.description || "-"}</td>
              </tr>
            ))}
            {paginatedHistories.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
