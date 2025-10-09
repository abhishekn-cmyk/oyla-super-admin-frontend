import { useState, useEffect } from "react";
import type { IRestaurant } from "../types/restarunt";
import type { MealType, ProductCategory } from "../types/product";
import { useProducts } from "../hooks/useProduct";
import { toast } from "react-toastify";

interface Props {
  restaurant: IRestaurant;
  type: "menu" | "popular";
  onClose: () => void;
  onAdd: (args: { restaurantId: string; data: FormData }) => Promise<any>;
}

const CATEGORY_OPTIONS: ProductCategory[] = ["main","breakfast","snack","salad","dessert","beverage"];
const MEALTYPE_OPTIONS: MealType[] = ["veg","non-veg","vegan","breakfast","lunch","dinner","snack","soup","salad","biriyani","main-meal"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProductModal({ restaurant, type, onClose, onAdd }: Props) {
  const { data: products = [] } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // --- Product fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>("main");
  const [mealType, setMealType] = useState<MealType>("veg");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [nutritionFat, setNutritionFat] = useState("");
  const [nutritionCarb, setNutritionCarb] = useState("");
  const [nutritionProtein, setNutritionProtein] = useState("");
  const [nutritionCalories, setNutritionCalories] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // --- Populate fields if product selected ---
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p._id === selectedProductId);
      if (product) {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price);
        setCategory(product.category || "main");
        setMealType(product.mealType || "veg");
        setAvailableDays(product.availableDays || []);
        setIngredients(product.ingredients || []);
        setNutritionFat(product.nutrition?.fat || "");
        setNutritionCarb(product.nutrition?.carbohydrate || "");
        setNutritionProtein(product.nutrition?.protein || "");
        setNutritionCalories(product.nutrition?.calories || "");
        setImage(null);
      }
    } else {
      setName("");
      setDescription("");
      setPrice(0);
      setCategory("main");
      setMealType("veg");
      setAvailableDays([]);
      setIngredients([]);
      setNutritionFat("");
      setNutritionCarb("");
      setNutritionProtein("");
      setNutritionCalories("");
      setImage(null);
    }
  }, [selectedProductId, products]);

  // --- Add / Update product ---
  const handleSubmit = async () => {
    if (!selectedProductId) return toast.error("Please select a product");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("category", category);
    formData.append("mealType", mealType);
    formData.append("availableDays", JSON.stringify(availableDays));
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append(
      "nutrition",
      JSON.stringify({
        fat: nutritionFat,
        carbohydrate: nutritionCarb,
        protein: nutritionProtein,
        calories: nutritionCalories,
      })
    );
    if (image) formData.append("image", image);

    try {
      await onAdd({ restaurantId: restaurant._id, data: formData });
      toast.success(`${name} added to ${type}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    }
  };

  // --- Ingredients handlers ---
  const handleIngredientChange = (value: string, index: number) => {
    const ing = [...ingredients];
    ing[index] = value;
    setIngredients(ing);
  };
  const addIngredientField = () => setIngredients([...ingredients, ""]);
  const removeIngredientField = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  // --- Available Days handlers ---
  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">
          {type === "menu" ? "Add Menu Item" : "Add Popular Item"}
        </h2>

        {/* Product Dropdown */}
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="">Select a Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Product Fields */}
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Category Radios */}
        <div className="mb-3">
          <p className="font-semibold mb-1">Category:</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map((cat) => (
              <label key={cat} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* MealType Radios */}
        <div className="mb-3">
          <p className="font-semibold mb-1">Meal Type:</p>
          <div className="flex flex-wrap gap-3">
            {MEALTYPE_OPTIONS.map((mt) => (
              <label key={mt} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  value={mt}
                  checked={mealType === mt}
                  onChange={() => setMealType(mt)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{mt.charAt(0).toUpperCase() + mt.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Available Days */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Available Days:</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <label key={day} className={`cursor-pointer px-3 py-1 rounded-lg border ${
                availableDays.includes(day) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
              }`}>
                <input
                  type="checkbox"
                  checked={availableDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="hidden"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-3">
          <p className="font-semibold mb-1">Ingredients:</p>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input
                type="text"
                value={ing}
                onChange={(e) => handleIngredientChange(e.target.value, i)}
                className="border px-2 py-1 rounded flex-1"
              />
              <button
                type="button"
                onClick={() => removeIngredientField(i)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredientField}
            className="bg-blue-600 text-white px-3 py-1 rounded mt-1"
          >
            Add Ingredient
          </button>
        </div>

        {/* Nutrition */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            type="text"
            placeholder="Fat"
            value={nutritionFat}
            onChange={(e) => setNutritionFat(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Carbs"
            value={nutritionCarb}
            onChange={(e) => setNutritionCarb(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Protein"
            value={nutritionProtein}
            onChange={(e) => setNutritionProtein(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Calories"
            value={nutritionCalories}
            onChange={(e) => setNutritionCalories(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        {/* Image */}
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full mb-3"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
