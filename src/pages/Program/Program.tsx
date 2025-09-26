import { useState } from "react";
import { Plus, Trash2, Edit2, X, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  useAddProgramProduct,
  useUpdateProgramProduct,
} from "../../hooks/useProgram";
import { useProducts } from "../../hooks/useProduct";
import type { IProgram } from "../../types/program";
import type { IProduct } from "../../types/product";

export default function Program() {
  const { data: programs = [], isLoading } = useGetPrograms();
  const { data: products = [], isLoading: isProductsLoading } = useProducts();

  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const deleteMutation = useDeleteProgram();
  const addProductMutation = useAddProgramProduct();
  const updateProductMutation = useUpdateProgramProduct();

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<IProgram | null>(null);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formProgram, setFormProgram] = useState({
    title: "",
    subtitle: "",
    tagline: "",
    description: "",
    category: "diet",
    image: null as File | null,
  });

  const [formProduct, setFormProduct] = useState({
    name: "",
    description: "",
    price: 0,
    image: null as File | null,
  });

  // Pagination calculations
  const totalPages = Math.ceil(programs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrograms = programs.slice(startIndex, endIndex);

  // File Handlers
  const handleProgramFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFormProgram({ ...formProgram, image: e.target.files[0] });
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFormProduct({ ...formProduct, image: e.target.files[0] });
  };

  // Program Submit
  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formProgram.title);
    data.append("subtitle", formProgram.subtitle);
    data.append("tagline", formProgram.tagline);
    data.append("description", formProgram.description);
    data.append("category", formProgram.category);
    if (formProgram.image) data.append("image", formProgram.image);

    if (editingProgram) {
      updateMutation.mutate(
        { id: editingProgram._id, data },
        {
          onSuccess: () => {
            toast.success("Program updated successfully");
            setShowProgramModal(false);
            setEditingProgram(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Program created successfully");
          setShowProgramModal(false);
        },
      });
    }
  };

  // Product Submit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return toast.error("No program selected");

    const data = new FormData();
    data.append("name", formProduct.name);
    data.append("description", formProduct.description);
    data.append("price", formProduct.price.toString());
    if (formProduct.image) data.append("image", formProduct.image);

    if (editingProduct) {
      updateProductMutation.mutate(
        { programId: editingProgram._id, productId: editingProduct._id, data },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setShowProductModal(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      addProductMutation.mutate(
        { programId: editingProgram._id, data },
        {
          onSuccess: () => {
            toast.success("Product added successfully");
            setShowProductModal(false);
          },
        }
      );
    }
  };

  // Delete Program
  const handleDeleteProgram = (program: IProgram) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    deleteMutation.mutate(program._id, { onSuccess: () => toast.success("Program deleted successfully") });
  };

  // Reset forms
  const resetProgramForm = () => {
    setFormProgram({ title: "", subtitle: "", tagline: "", description: "", category: "diet", image: null });
    setEditingProgram(null);
  };

  const resetProductForm = () => {
    setFormProduct({ name: "", description: "", price: 0, image: null });
    setEditingProduct(null);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className=" bg-gray-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-600 mt-2">Create and manage fitness programs and their products</p>
        </div>

        {/* Controls Bar */}
   <div className="flex justify-between items-center mb-6 gap-4">
  {/* Items Per Page Selector - left */}
  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-gray-700">Show:</label>
    <select
      value={itemsPerPage}
      onChange={handleItemsPerPageChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
    </select>
    <span className="text-sm text-gray-600">entries per page</span>
  </div>

  {/* Add Program Button - right */}
  <button
    onClick={() => {
      setShowProgramModal(true);
      resetProgramForm();
    }}
    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
  >
    <Plus size={20} />
    Add New Program
  </button>
</div>



        {/* Program Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  {["Program", "Category", "Products", "Actions"].map((col) => (
                    <th key={col} className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center gap-3 text-gray-500">
                        <Loader size={20} className="animate-spin" />
                        <span>Loading programs...</span>
                      </div>
                    </td>
                  </tr>
                ) : programs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Plus size={24} className="text-gray-400" />
                        </div>
                        <p className="font-medium">No programs found</p>
                        <p className="text-sm">Get started by creating your first program</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPrograms.map((program) => (
                    <tr key={program._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-4 py-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{program.title}</h3>
                          {program.subtitle && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.subtitle}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                          {program.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {program.product.length} products
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setEditingProgram(program);
                              setFormProgram({
                                title: program.title,
                                subtitle: program.subtitle || "",
                                tagline: program.tagline || "",
                                description: program.description || "",
                                category: program.category,
                                image: null,
                              });
                              setShowProgramModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            <Edit2 size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProgram(program)}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingProgram(program);
                              resetProductForm();
                              setShowProductModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Product</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {programs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, programs.length)} of {programs.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-lg"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Program Modal */}
        {showProgramModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProgram ? "Edit Program" : "Create New Program"}
                </h2>
                <button
                  onClick={() => {
                    setShowProgramModal(false);
                    resetProgramForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleProgramSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Row 1: Title and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      placeholder="Program title"
                      value={formProgram.title}
                      onChange={e => setFormProgram({...formProgram, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formProgram.category}
                      onChange={e => setFormProgram({...formProgram, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {["diet", "bodybuilding", "yoga", "wellness", "vegan diet", "keto diet", "weight loss", "strength training"].map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Subtitle and Tagline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      placeholder="Program subtitle"
                      value={formProgram.subtitle}
                      onChange={e => setFormProgram({...formProgram, subtitle: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      placeholder="Short tagline"
                      value={formProgram.tagline}
                      onChange={e => setFormProgram({...formProgram, tagline: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 3: Description (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Program description"
                    rows={4}
                    value={formProgram.description}
                    onChange={e => setFormProgram({...formProgram, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Row 4: Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Image</label>
                  <input
                    type="file"
                    onChange={handleProgramFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProgramModal(false);
                      resetProgramForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader size={16} className="animate-spin" />
                    ) : null}
                    {editingProgram ? "Update Program" : "Create Program"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && editingProgram && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">to {editingProgram.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Row 1: Product Selection and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Product *</label>
                    <select
                      value={products.find(p => p.name === formProduct.name)?._id || ""}
                      onChange={(e) => {
                        const selected = products.find(p => p._id === e.target.value);
                        if (selected) {
                          setFormProduct({
                            name: selected.name,
                            description: selected.description || "",
                            price: selected.price || 0,
                            image: null,
                          });
                        } else {
                          resetProductForm();
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Choose a product...</option>
                      {isProductsLoading ? (
                        <option disabled>Loading products...</option>
                      ) : (
                        products.map(prod => (
                          <option key={prod._id} value={prod._id}>{prod.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formProduct.price}
                        onChange={(e) => setFormProduct({ ...formProduct, price: +e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Description (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Product description"
                    rows={3}
                    value={formProduct.description}
                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Row 3: Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <input
                    type="file"
                    onChange={handleProductFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      resetProductForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                      <Loader size={16} className="animate-spin" />
                    ) : null}
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}