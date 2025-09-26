import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../../hooks/useProduct";
import type { IProduct, ProductCategory, MealType, INutrition } from "../../types/product";
import { FiEdit, FiTrash, FiPlus, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Product() {
  // --- Queries & Mutations ---
  const { data: products = [],isLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // --- Pagination ---
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  // --- Modal & Form state ---
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>("main");
  const [features, setFeatures] = useState("");
  const [mealType, setMealType] = useState<MealType>("veg");
  const [nutrition, setNutrition] = useState<INutrition>({});
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  // --- Modal Handlers ---
  const openModal = (product?: IProduct) => {
    setIsOpen(true);
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setTagline(product.tagline || "");
      setDescription(product.description || "");
      setPrice(product.price);
      setCategory(product.category || "main");
      setFeatures(product.features || "");
      setMealType(product.mealType || "veg");
      setNutrition(product.nutrition || {});
      setIngredients(product.ingredients || []);
      setAvailableDates(product.availableDates || []);
      setImage(null);
    } else resetForm();
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setTagline("");
    setDescription("");
    setPrice(0);
    setCategory("main");
    setFeatures("");
    setMealType("veg");
    setNutrition({});
    setIngredients([]);
    setAvailableDates([]);
    setImage(null);
  };

  // --- Ingredients ---
  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (value: string, i: number) =>
    setIngredients(ingredients.map((ing, idx) => (idx === i ? value : ing)));

  // --- Available Dates ---
  const addDate = () => setAvailableDates([...availableDates, ""]);
  const removeDate = (i: number) => setAvailableDates(availableDates.filter((_, idx) => idx !== i));
  const updateDate = (value: string, i: number) =>
    setAvailableDates(availableDates.map((d, idx) => (idx === i ? value : d)));

  // --- Submit ---
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("tagline", tagline);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("category", category);
    formData.append("features", features);
    formData.append("mealType", mealType);
    formData.append("nutrition", JSON.stringify(nutrition));
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("availableDates", JSON.stringify(availableDates));
    if (image) formData.append("image", image);

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct._id, formData });
        toast.success("Product updated successfully");
      } else {
        await createProductMutation.mutateAsync(formData);
        toast.success("Product created successfully");
      }
      closeModal();
      setPage(1);
    } catch (err) {
      toast.error("Failed to save product");
      console.error(err);
    }
  };

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Product deleted successfully");
      setPage(1);
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  const totalProducts = products.length;
  const vegProducts = products.filter(p => p.mealType === "dinner").length;
  const nonVegProducts = products.filter(p => p.mealType === "lunch").length;
  const veganProducts = products.filter(p => p.mealType === "breakfast").length;

  return (
    <div className=" bg-gray-50 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600 font-medium">Total Products</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FiPlus className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600 font-medium">Dinner Products</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{vegProducts}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="text-green-600 text-xl font-bold">D</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600 font-medium">Lunch Products</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{nonVegProducts}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <span className="text-orange-600 text-xl font-bold">L</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600 font-medium">Breakfast Products</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{veganProducts}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="text-purple-600 text-xl font-bold">B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Management</h1>
    <p className="text-gray-600 mt-1">Manage your products and inventory</p>
  </div>

  <button
    onClick={() => openModal()}
    className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
  >
    <FiPlus className="text-lg" />
    Add Product
  </button>
</div>


      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tagline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <img
                      src={p.image ? `${import.meta.env.VITE_API_URL}/${p.image}` : "/default-user-icon.png"}
                      alt={p.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-600">${p.price}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-600 text-sm line-clamp-1">{p.tagline}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.mealType === 'veg' ? 'bg-green-100 text-green-800' :
                      p.mealType === 'non-veg' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {p.mealType}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-600 capitalize">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <FiTrash className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 mt-1">Get started by adding your first product</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(page * pageSize, products.length)}</span> of{" "}
            <span className="font-semibold">{products.length}</span> products
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(products.length / pageSize) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg border transition-colors ${
                    page === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === Math.ceil(products.length / pageSize)}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      placeholder="Enter catchy tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="Enter product description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-vertical"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProductCategory)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="main">Main Course</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="snack">Snack</option>
                        <option value="salad">Salad</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    <input
                      type="text"
                      placeholder="Key features separated by commas"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealType)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="soup">Soup</option>
                      <option value="salad">Salad</option>
                      <option value="biriyani">Biriyani</option>
                      <option value="main-meal">Main Meal</option>
                    </select>
                  </div>

                  {/* Nutrition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition (per serving)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Fat (g)"
                          value={nutrition.fat || ""}
                          onChange={(e) => setNutrition({ ...nutrition, fat: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Carbs (g)"
                          value={nutrition.carbohydrate || ""}
                          onChange={(e) => setNutrition({ ...nutrition, carbohydrate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Protein (g)"
                          value={nutrition.protein || ""}
                          onChange={(e) => setNutrition({ ...nutrition, protein: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Calories"
                          value={nutrition.calories || ""}
                          onChange={(e) => setNutrition({ ...nutrition, calories: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    <div className="space-y-2">
                      {ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={ing}
                            onChange={(e) => updateIngredient(e.target.value, i)}
                            placeholder={`Ingredient ${i + 1}`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeIngredient(i)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium"
                      >
                        + Add Ingredient
                      </button>
                    </div>
                  </div>

                  {/* Available Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Dates</label>
                    <div className="space-y-2">
                      {availableDates.map((date, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => updateDate(e.target.value, i)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeDate(i)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDate}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium"
                      >
                        + Add Date
                      </button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setImage(e.target.files[0])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ||isLoading ? (
                  "Saving..."
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}