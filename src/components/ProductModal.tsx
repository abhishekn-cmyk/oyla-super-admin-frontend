import { useState, useEffect } from "react";
import type { IRestaurant } from "../types/restarunt";
import type {  MealType, ProductCategory } from "../types/product";
import { useProducts } from "../hooks/useProduct";
import { toast } from "react-toastify";
// IProduct,
interface Props {
  restaurant: IRestaurant;
  type: "menu" | "popular";
  onClose: () => void;
  onAdd: (args: { restaurantId: string; data: FormData }) => Promise<any>;
}

export default function ProductModal({ restaurant, type, onClose, onAdd }: Props) {
  const { data: products = [] } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // --- Product fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>("main");
  const [mealType, setMealType] = useState<MealType>("veg");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
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
        setAvailableDates(
          product.availableDates?.map((d) => new Date(d).toISOString().slice(0, 10)) || []
        );
        setIngredients(product.ingredients || []);
        setNutritionFat(product.nutrition?.fat || "");
        setNutritionCarb(product.nutrition?.carbohydrate || "");
        setNutritionProtein(product.nutrition?.protein || "");
        setNutritionCalories(product.nutrition?.calories || "");
        setImage(null); // user can upload new image
      }
    } else {
      setName("");
      setDescription("");
      setPrice(0);
      setCategory("main");
      setMealType("veg");
      setAvailableDates([]);
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
   formData.append("mealType", mealType);  // => "lunch" becomes '"lunch"'

    formData.append("availableDates", JSON.stringify(availableDates));
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

  // --- Available dates handlers ---
  const handleDateChange = (value: string, index: number) => {
    const dates = [...availableDates];
    dates[index] = value;
    setAvailableDates(dates);
  };
  const addDateField = () => setAvailableDates([...availableDates, ""]);
  const removeDateField = (index: number) =>
    setAvailableDates(availableDates.filter((_, i) => i !== index));

  // --- Ingredients handlers ---
  const handleIngredientChange = (value: string, index: number) => {
    const ing = [...ingredients];
    ing[index] = value;
    setIngredients(ing);
  };
  const addIngredientField = () => setIngredients([...ingredients, ""]);
  const removeIngredientField = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

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

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="main">Main</option>
          <option value="breakfast">Breakfast</option>
          <option value="snack">Snack</option>
          <option value="salad">Salad</option>
          <option value="dessert">Dessert</option>
          <option value="beverage">Beverage</option>
        </select>

        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
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

        {/* Available Dates */}
        <div className="mb-3">
          <p className="font-semibold mb-1">Available Dates:</p>
          {availableDates.map((date, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value, i)}
                className="border px-2 py-1 rounded"
              />
              <button
                type="button"
                onClick={() => removeDateField(i)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDateField}
            className="bg-blue-600 text-white px-3 py-1 rounded mt-1"
          >
            Add Date
          </button>
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
                className="border px-2 py-1 rounded"
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
