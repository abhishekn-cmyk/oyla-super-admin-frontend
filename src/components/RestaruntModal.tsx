import { useState, useEffect, type FormEvent } from "react";
import type { IRestaurant } from "../types/restarunt";
import { FiX } from "react-icons/fi";
import { useCreateRestaurant, useUpdateRestaurant } from "../hooks/useRestarunt";
import { toast } from "react-toastify";

interface RestaurantModalProps {
  restaurant?: IRestaurant | null;
  onClose: () => void;
}

export default function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [rating, setRating] = useState<number>(0); // Added rating state

  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();

  // Initialize form
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setDescription(restaurant.description || "");

      // Clean features array to a plain string
      let cleanedFeatures = "";
      if (Array.isArray(restaurant.features) && restaurant.features.length > 0) {
        try {
          const parsed = JSON.parse(restaurant.features[0]);
          if (Array.isArray(parsed)) cleanedFeatures = parsed.join(", ");
          else if (typeof parsed === "string") cleanedFeatures = parsed;
        } catch {
          cleanedFeatures = restaurant.features[0].replace(/[\[\]"\\]/g, "");
        }
      }
      setFeatures(cleanedFeatures);

      setAddress(restaurant.address || "");
      setLat(restaurant.location?.lat || "");
      setLng(restaurant.location?.lng || "");
      setRating(restaurant.rating || 0); // Existing restaurant rating
    } else {
      // Auto-fetch browser location if creating new restaurant
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
          },
          (err) => console.warn("Geolocation error:", err)
        );
      }
      // Auto-generate random rating between 3 and 5
      setRating(Math.floor(Math.random() * 3) + 3);
    }
  }, [restaurant]);

  const handleRestaurantSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("address", address);

    // Convert features string back to array for backend
    const featuresArray = features.split(",").map((f) => f.trim()).filter(Boolean);
    formData.append("features", JSON.stringify(featuresArray));

    formData.append("location", JSON.stringify({ lat, lng }));
    formData.append("rating", rating.toString()); // Append rating
    if (image) formData.append("image", image);

    if (restaurant) {
      updateMutation.mutate(
        { id: restaurant._id, data: formData },
        {
          onSuccess: () => toast.success("Restaurant updated successfully"),
          onError: () => toast.error("Failed to update restaurant"),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => toast.success("Restaurant created successfully"),
        onError: () => toast.error("Failed to create restaurant"),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">{restaurant ? "Edit Restaurant" : "Add Restaurant"}</h2>

        <form onSubmit={handleRestaurantSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Restaurant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded-xl"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded-xl"
          />
          <textarea
            placeholder="Features (comma separated)"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="w-full border px-3 py-2 rounded-xl"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded-xl"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              className="w-1/2 border px-3 py-2 rounded-xl"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              className="w-1/2 border px-3 py-2 rounded-xl"
            />
          </div>
          <input
            type="number"
            placeholder="Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            min={1}
            max={20}
            step={0.1}
            className="w-full border px-3 py-2 rounded-xl"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            {restaurant ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
