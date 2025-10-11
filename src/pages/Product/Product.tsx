import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../hooks/useProduct";
import type { IProduct, ProductCategory, MealType, INutrition } from "../../types/product";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Product() {
  // --- Queries & Mutations ---
  const { data: products = [] } = useProducts();
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
  const [taglines, setTaglines] = useState<string[]>([]); // now an array
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>("main");
  const [features, setFeatures] = useState("");
  const [mealType, setMealType] = useState<MealType>("veg");
  const [nutrition, setNutrition] = useState<INutrition>({});
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  // --- Modal Handlers ---
  const openModal = (product?: IProduct) => {
    setIsOpen(true);
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setTaglines(Array.isArray(product.taglines) ? product.taglines : product.taglines|| []);
      setDescription(product.description || "");
      setCost(product.costPrice || 0);
      setBasePrice(product.basePrice || 0);
      setCategory(product.category || "main");
      setFeatures(product.features || "");
      setMealType(product.mealType || "veg");
      setNutrition(product.nutrition || {});
      setIngredients(product.ingredients || []);
      setAvailableDays(product.availableDays || []);
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
    setTaglines([]);
    setDescription("");
    setCost(0);
    setBasePrice(0);
    setCategory("main");
    setFeatures("");
    setMealType("veg");
    setNutrition({});
    setIngredients([]);
    setAvailableDays([]);
    setImage(null);
  };

  // --- Ingredients ---
  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (value: string, i: number) =>
    setIngredients(ingredients.map((ing, idx) => (idx === i ? value : ing)));

  // --- Available Days ---
  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // --- Taglines ---
  const handleTaglineChange = (value: string) => {
    setTaglines(value.split(",").map(t => t.trim()).filter(t => t));
  };

  // --- Submit ---
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("taglines", JSON.stringify(taglines)); // send array
    formData.append("description", description);
    formData.append("costPrice", cost.toString());
    formData.append("basePrice", basePrice.toString());
    formData.append("category", category);
    formData.append("features", features);
    formData.append("mealType", mealType);
    formData.append("nutrition", JSON.stringify(nutrition));

    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("availableDays", JSON.stringify(availableDays));
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

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> Add Product
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img src={p.image ? `${import.meta.env.VITE_API_URL}/${p.image}` : "/default-user-icon.png"} alt={p.name} className="w-12 h-12 object-cover rounded-lg"/>
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">${p.costPrice}</td>
                  <td className="px-4 py-3">{p.mealType}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openModal(p)} className="text-blue-600 mr-2"><FiEdit /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600"><FiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded">Prev</button>
        <span className="px-2 py-1">{page}</span>
        <button disabled={page === Math.ceil(products.length / pageSize)} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded">Next</button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={closeModal}><FiX /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2"/>
              </div>

              {/* Taglines */}
              <div>
                <label className="block text-sm font-medium mb-1">Taglines (comma separated)</label>
                <input type="text" value={taglines.join(",")} onChange={(e) => handleTaglineChange(e.target.value)} className="w-full border rounded px-3 py-2"/>
                <div className="flex flex-wrap gap-2 mt-2">
                  {taglines.map((t,i)=> <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{t}</span>)}
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium mb-1">Cost</label>
                <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full border rounded px-3 py-2"/>
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium mb-1">Base Price</label>
                <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full border rounded px-3 py-2"/>
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Meal Type</label>
                <select value={mealType} onChange={(e)=>setMealType(e.target.value as MealType)} className="w-full border rounded px-3 py-2">
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              {/* Category radios */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "diet",
                    "bodybuilding",
                    "yoga",
                    "wellness",
                    "vegan diet",
                    "healthy food",
                    "keto diet",
                    "intermittent fasting",
                    "weight loss",
                    "strength training",
                    "cardio",
                    "pilates",
                    "meditation",
                  ].map(cat => (
                    <label key={cat} className="flex items-center gap-1">
                      <input type="radio" value={cat} checked={category===cat} onChange={()=>setCategory(cat as ProductCategory)} className="accent-blue-600"/>
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                {ingredients.map((ing,i)=>(
                  <div key={i} className="flex gap-2 mb-1">
                    <input type="text" value={ing} onChange={e=>updateIngredient(e.target.value,i)} className="flex-1 border rounded px-2 py-1"/>
                    <button onClick={()=>removeIngredient(i)} className="text-red-600 font-bold px-2">X</button>
                  </div>
                ))}
                <button onClick={addIngredient} className="text-blue-600 mt-1">+ Add Ingredient</button>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium mb-1">Available Days</label>
                <div className="flex gap-2 flex-wrap">
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                    <label key={day} className="flex items-center gap-1">
                      <input type="checkbox" checked={availableDays.includes(day)} onChange={()=>toggleDay(day)}/>
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              {/* Nutrition */}
{/* Nutrition */}
<div>
  <label className="block text-sm font-medium mb-1">Nutrition</label>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    <div>
      <label className="block text-xs text-gray-500 mb-1">Calories</label>
      <input
        type="text"
        placeholder="e.g. 200 kcal"
        value={nutrition.calories || ""}
        onChange={(e) =>
          setNutrition({ ...nutrition, calories: e.target.value })
        }
        className="w-full border rounded px-2 py-1"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-1">Protein</label>
      <input
        type="text"
        placeholder="e.g. 10g"
        value={nutrition.protein || ""}
        onChange={(e) =>
          setNutrition({ ...nutrition, protein: e.target.value })
        }
        className="w-full border rounded px-2 py-1"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-1">Carbohydrate</label>
      <input
        type="text"
        placeholder="e.g. 20g"
        value={nutrition.carbohydrate || ""}
        onChange={(e) =>
          setNutrition({ ...nutrition, carbohydrate: e.target.value })
        }
        className="w-full border rounded px-2 py-1"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-1">Fat</label>
      <input
        type="text"
        placeholder="e.g. 5g"
        value={nutrition.fat || ""}
        onChange={(e) =>
          setNutrition({ ...nutrition, fat: e.target.value })
        }
        className="w-full border rounded px-2 py-1"
      />
    </div>
  </div>
</div>



              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input type="file" onChange={e=>setImage(e.target.files?.[0]||null)} />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingProduct?"Update":"Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
