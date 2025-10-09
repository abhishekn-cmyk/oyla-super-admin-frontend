import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, LabelList,
  type PieLabelRenderProps
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQueryClient } from "@tanstack/react-query";
import { useExpenses, useAddExpense, useAllocateExpense, useProfitLoss } from "../../hooks/useExpenses";
import { useCategories } from "../../hooks/category";
import { useProducts } from "../../hooks/useProduct";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];
const tabs = ["Add Expense", "Expense Charts", "Expense Stats", "Profit & Loss", "Allocate Expense"] as const;
type Tab = (typeof tabs)[number];

// Define proper interfaces that match your data structure
interface Expense {
  _id: string;
  category: string;
  amount: number;
  quantity: number;
  date: string;
  item: string;
}

interface Allocation {
  productId: string;
  amount: number;
}

interface ChartDataItem {
  category: string;
  amount: number;
}

interface ProfitLossItem {
  productId: string;
  name: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  loss: number;
}

interface ProfitLossResponse {
  products: ProfitLossItem[];
}

// Type guard to check if data is ProfitLossResponse
function isProfitLossResponse(data: any): data is ProfitLossResponse {
  return data && Array.isArray(data.products);
}

export default function ExpensesDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Add Expense");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Allocate Expense state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [allocation, setAllocation] = useState<Allocation[]>([]);

  const queryClient = useQueryClient();

  // Hooks
  const { data: categories = [] } = useCategories();
  const { data: expenses = [] } = useExpenses();
  const { data: products = [] } = useProducts();
  const addExpenseMutation = useAddExpense();
  const allocateExpenseMutation = useAllocateExpense();
  const { 
    data: profitLossData, 
    isLoading: isPLLoading, 
    error: plError 
  } = useProfitLoss();

  // Default category selection
  useEffect(() => {
    if (categories.length && !selectedCategory) setSelectedCategory(categories[0].name);
  }, [categories]);

  // File input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  // Add expense handler
  const handleAddExpense = () => {
    if (!selectedCategory || !amount || !quantity) {
      toast.error("Please select category and enter valid amount & quantity");
      return;
    }

    const formData = new FormData();
    const currentDate = new Date().toISOString().split("T")[0];
    formData.append("item", selectedCategory);
    formData.append("category", selectedCategory);
    formData.append("amount", amount.toString());
    formData.append("quantity", quantity.toString());
    formData.append("date", currentDate);
    files.forEach(file => formData.append("images", file));

    setIsLoading(true);
    addExpenseMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Expense added successfully!");
        setAmount(0);
        setQuantity(0);
        setFiles([]);
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["profitLoss"] });
      },
      onError: (err: any) => {
        toast.error("Failed to add expense: " + err.message);
        setIsLoading(false);
      }
    });
  };

  // Prepare chart data dynamically based on actual expenses
  const chartData: ChartDataItem[] = categories.map(cat => {
    const total = expenses.filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { category: cat.name, amount: total };
  }).filter(d => d.amount > 0);

  const totalExpenses = chartData.reduce((sum, d) => sum + d.amount, 0);

  const generateTicks = (data: ChartDataItem[], maxLimit = 100000) => {
    const maxValue = Math.max(...data.map(d => d.amount), 0);
    const topValue = Math.min(Math.ceil(maxValue / 1000) * 1000, maxLimit);
    const steps = [0, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
    return steps.filter(s => s <= topValue);
  };

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    if (!percent || percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const innerR = innerRadius as number;
    const outerR = outerRadius as number;
    const radius = innerR + (outerR - innerR) * 0.5;
    const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
    const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
    const categoryName = chartData[index]?.category || "";
    const percentValue = percent as number;
    return (
      <text x={x} y={y} fill="white" textAnchor={x > (cx as number) ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${categoryName}: ${(percentValue * 100).toFixed(1)}%`}
      </text>
    );
  };

  const formatAmountLabel = (label: React.ReactNode) => {
    const value = Number(label);
    return value >= 1000 ? `${value / 1000}k` : value.toString();
  };

  // Allocation change
  const handleAllocationChange = (productId: string, value: number) => {
    setAllocation(prev => {
      const existing = prev.find(a => a.productId === productId);
      if (existing) return prev.map(a => a.productId === productId ? { ...a, amount: value } : a);
      return [...prev, { productId, amount: value }];
    });
  };

  // Save allocation
  const handleSaveAllocation = () => {
    if (!selectedExpense) return;

    const totalAllocated = allocation.reduce((sum, a) => sum + a.amount, 0);
    if (totalAllocated > selectedExpense.amount) {
      toast.error("Total allocated amount exceeds expense amount!");
      return;
    }

    allocation.forEach(a => {
      allocateExpenseMutation.mutate({
        productId: a.productId,
        expenseId: selectedExpense._id,
        amount: a.amount,
        expenseAmount: a.amount
      }, {
        onSuccess: () => {
          toast.success(`Allocated ${a.amount} KD to product successfully!`);
          queryClient.invalidateQueries({ queryKey: ["expenses"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["profitLoss"] });
        },
        onError: (err: any) => toast.error("Failed to allocate expense: " + err.message)
      });
    });

    setSelectedExpense(null);
    setAllocation([]);
  };

  // Compute dynamic Profit & Loss based on actual expenses
  const computedProfitLoss: ProfitLossItem[] = products.map(prod => {
    // Handle different possible data structures from profitLossData
    let apiData: ProfitLossItem | undefined;
    
    if (isProfitLossResponse(profitLossData)) {
      // If it's ProfitLossResponse structure
      apiData = profitLossData.products.find(p => p.productId.toString() === prod._id.toString());
    } else if (Array.isArray(profitLossData)) {
      // If it's directly an array of ProfitLossItem
      apiData = profitLossData.find(p => p.productId.toString() === prod._id.toString());
    }
    
    const profitOrLoss = (apiData?.profit || 0) - (apiData?.loss || 0);
    const profit = profitOrLoss > 0 ? profitOrLoss : 0;
    const loss = profitOrLoss < 0 ? Math.abs(profitOrLoss) : 0;
    return {
      productId: prod._id,
      name: prod.name,
      totalRevenue: apiData?.totalRevenue || 0,
      totalCost: apiData?.totalCost || 0,
      profit,
      loss,
    };
  }).filter(p => p.totalCost > 0 || p.totalRevenue > 0);

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Expenses Dashboard</h2>

      {/* Tabs with Prev/Next */}
      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        {/* Tabs */}
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 font-semibold text-sm tracking-wide rounded-t-lg transition-all ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const currentIndex = tabs.indexOf(activeTab);
              const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
              setActiveTab(tabs[prevIndex]);
            }}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Prev
          </button>
          <button
            onClick={() => {
              const currentIndex = tabs.indexOf(activeTab);
              const nextIndex = (currentIndex + 1) % tabs.length;
              setActiveTab(tabs[nextIndex]);
            }}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {/* --- Add Expense --- */}
        {activeTab === "Add Expense" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-6 items-end justify-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-blue-500 outline-none">
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input type="number" min={1} value={quantity || ""} onChange={e => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KD)</label>
                <input type="number" min={1} value={amount || ""} onChange={e => setAmount(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <input type="file" multiple onChange={handleFileChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <button onClick={handleAddExpense} disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {isLoading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        )}

        {/* --- Expense Charts --- */}
        {activeTab === "Expense Charts" && chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-10">
            <div className="bg-gray-50 rounded-xl shadow p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Expenses by Category (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis ticks={generateTicks(chartData)} tickFormatter={formatAmountLabel}/>
                  <Tooltip formatter={(value: number) => [`${value} KD`, "Amount"]}/>
                  <Legend/>
                  <Bar dataKey="amount" name="Amount (KD)">
                    {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                    <LabelList dataKey="amount" position="top" formatter={formatAmountLabel}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 rounded-xl shadow p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Expense Distribution (Pie Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.map(d => ({ ...d, value: d.amount }))} dataKey="value" nameKey="category"
                    outerRadius={100} label={renderCustomizedLabel} labelLine={false}>
                    {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(value: number) => {
                    const percent = ((value / totalExpenses) * 100).toFixed(1);
                    return [`${value.toFixed(2)} KD (${percent}%)`, "Amount"];
                  }}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* --- Expense Stats --- */}
        {activeTab === "Expense Stats" && (
          <div className="bg-gray-50 rounded-xl shadow p-6 text-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-700">Overall Expense Summary</h3>
            {chartData.length > 0 ? (
              <>
                <p className="text-lg text-gray-700">💰 <strong>Total Expenses:</strong> {totalExpenses.toFixed(2)} KD</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {chartData.map(d => (
                    <div key={d.category} className="bg-white border rounded-xl p-4 shadow-sm">
                      <h4 className="text-md font-semibold text-gray-700">{d.category}</h4>
                      <p className="text-blue-600 text-lg font-bold mt-1">{d.amount.toFixed(2)} KD</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (<p className="text-gray-500">No expense data available yet.</p>)}
          </div>
        )}

        {/* --- Profit & Loss --- */}
        {activeTab === "Profit & Loss" && (
          <div className="space-y-6">
            {isPLLoading ? (
              <p>Loading Profit & Loss data...</p>
            ) : plError ? (
              <p className="text-red-500">Error: {plError.message}</p>
            ) : computedProfitLoss.length === 0 ? (
              <p>No Profit & Loss data available</p>
            ) : (
              <table className="min-w-full bg-white border rounded-xl">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="py-3 px-4 border">Product</th>
                    <th className="py-3 px-4 border">Revenue</th>
                    <th className="py-3 px-4 border">Cost</th>
                    <th className="py-3 px-4 border">Profit</th>
                    <th className="py-3 px-4 border">Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {computedProfitLoss.map((p) => (
                    <tr key={p.productId} className="hover:bg-gray-50 text-gray-800">
                      <td className="py-2 px-4 border">{p.name}</td>
                      <td className="py-2 px-4 border">{p.totalRevenue.toFixed(2)}</td>
                      <td className="py-2 px-4 border">{p.totalCost.toFixed(2)}</td>
                      <td className="py-2 px-4 border text-green-600">{p.profit.toFixed(2)}</td>
                      <td className="py-2 px-4 border text-red-600">{p.loss.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- Allocate Expense --- */}
        {activeTab === "Allocate Expense" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Expense</label>
             <select
  value={selectedExpense?._id || ""}
  onChange={e => {
  const exp = expenses.find(ex => ex._id === e.target.value);
  setSelectedExpense(exp as Expense | null);
  setAllocation([]);
}}

  className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
>

                <option value="">-- Select Expense --</option>
                {expenses.map(exp => (
                  <option key={exp._id} value={exp._id}>
                    {exp.item} - {exp.amount.toFixed(2)} KD
                  </option>
                ))}
              </select>
            </div>

            {selectedExpense && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-700">Allocate Amount to Products</h4>
                {products.map(product => {
                  const allocated = allocation.find(a => a.productId === product._id)?.amount || 0;
                  return (
                    <div key={product._id} className="flex items-center gap-4">
                      <span className="w-48">{product.name}</span>
                      <input 
                        type="number" 
                        min={0} 
                        max={selectedExpense.amount} 
                        value={allocated}
                        onChange={e => handleAllocationChange(product._id, Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                      <span className="text-sm text-gray-500">KD</span>
                    </div>
                  );
                })}
                <button 
                  onClick={handleSaveAllocation}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Save Allocation
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}