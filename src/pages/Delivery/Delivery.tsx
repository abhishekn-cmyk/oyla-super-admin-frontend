import { useState,useEffect } from "react";
import {
  usePartners,
  useDeliveries,
  useOverallStats,
  useCreatePartner,
  useDeletePartner,
  usePartner,
  useAssignOrder,
  useUpdatePartner,
  usePartnerOrders,
  useUpdateOrderStatus,
} from "../../hooks/usedeliver";
import { useGetOrders } from "../../hooks/useorder";
import { toast } from "react-toastify";

type UpdateFormType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentStatus: "available" | "busy" | "offline";
   vehicleType: string,
  vehicleNumber: string,
  licenseNumber: string,
};

export default function Delivery() {
  
const ITEMS_PER_PAGE = 5;
  const tabs = [
    "partners",
    "deliveries",
   
    "add-driver",
    "update-partner",
    "assign-order",
    "view-partner",
    "track-orders",
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex];

  // Queries
  const { data: partners, isLoading: loadingPartners } = usePartners();
  const { data: deliveries, isLoading: loadingDeliveries } = useDeliveries();
//   const { data: statsResponse, isLoading: loadingStats } = useOverallStats();
const [currentPage, setCurrentPage] = useState(1);

// // Then extract the inner data
// const stats = statsResponse?.data;
  console.log(useOverallStats());
  const { data: orders } = useGetOrders();

  // Track Orders
  const [trackDriverId, setTrackDriverId] = useState("");
  const { data: driverOrders, isLoading: loadingDriverOrders } = usePartnerOrders(trackDriverId);
  const updateOrderStatus = useUpdateOrderStatus();

  // Mutations
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();
  const assignOrder = useAssignOrder();
 const admins = localStorage.getItem("superadmin");
  const adminId = admins ? JSON.parse(admins)._id : undefined;

  // Local form states
  const [newPartner, setNewPartner] = useState({
  name: "",
  email: "",
  phone: "",
 
  vehicleType: "",
  vehicleNumber: "",
  licenseNumber: "",
  adminId:adminId, // optional if you want to assign an admin
});

  const [updateForm, setUpdateForm] = useState<UpdateFormType>({
    id: "",
    name: "",
    email: "",
    phone: "",
    currentStatus: "available",
     vehicleType: "",
  vehicleNumber: "",
  licenseNumber: "",
  });

  const [assignForm, setAssignForm] = useState({
    orderId: "",
    driverId: "",
    userId: "",
  });

  // View Partner
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const { data: selectedPartner, isLoading: loadingPartner } = usePartner(selectedPartnerId || "");

  // Navigation
  const nextTab = () => setActiveIndex((prev) => (prev + 1) % tabs.length);
  const prevTab = () => setActiveIndex((prev) => (prev - 1 + tabs.length) % tabs.length);

  // Handlers
  const handleCreatePartner = (e: React.FormEvent) => {
  e.preventDefault();
  // const admins = localStorage.getItem("superadmin");
  // const adminId = admins ? JSON.parse(admins)._id : undefined;

  // Call the mutation with the full partner data
  createPartner.mutate(newPartner);

  // Reset the form including all fields
  setNewPartner({
    name: "",
    email: "",
    phone: "",
   
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    adminId: "",
  });
};


  const handleDeletePartner = (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      deletePartner.mutate(id);
    }
  };

 const handleToggleStatus = (partner: any) => {
  // Default to 'offline' if undefined
  const status = partner.currentStatus ?? "offline";

  // Define the order of statuses
  const statusOrder: ("available" | "busy" | "offline")[] = ["available", "busy", "offline"];

  // Get next status in the cycle
  const currentIndex = statusOrder.indexOf(status);
  const nextIndex = (currentIndex + 1) % statusOrder.length;
  const newStatus = statusOrder[nextIndex];

  // Call mutation to update partner
  updatePartner.mutate({ id: partner._id, data: { currentStatus: newStatus } });
};

  const handleAssignOrder = (e: React.FormEvent) => {
    e.preventDefault();
    assignOrder.mutate(assignForm, {
      onSuccess: () => {
        toast.success("Order assigned successfully!");
        setAssignForm({ orderId: "", driverId: "", userId: "" });
      },
      onError: (err: any) => {
        toast.error("Failed to assign order: " + (err.response?.data?.message || err.message));
      },
    });
  };
  // Add this near your other queries to see the actual data structure
useEffect(() => {
  if (driverOrders) {
    console.log('Driver orders data structure:', driverOrders);
  }
}, [driverOrders]);

  const handleUpdatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.id) return alert("Please select a partner first");
    updatePartner.mutate({ id: updateForm.id, data: updateForm });
  };

  const orderList = orders || [];

  return (
    <div className="">
      {/* Tabs Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                activeIndex === i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prevTab} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">
            ◀ Prev
          </button>
          <button onClick={nextTab} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">
            Next ▶
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border rounded-lg p-6">
        {/* Partners */}
       {activeTab === "partners" && (
  <div>
    <h2 className="text-xl font-bold mb-4">Delivery Partners</h2>

    {loadingPartners ? (
      <p>Loading partners...</p>
    ) : partners?.length ? (
      <div className="space-y-3">
        {partners.map((p) => {
          // Default to 'offline' if undefined
          const status = p.currentStatus ?? "offline";

          let statusColor = "";
          switch (status) {
            case "available":
              statusColor = "bg-green-100 text-green-700";
              break;
            case "busy":
              statusColor = "bg-yellow-100 text-yellow-700";
              break;
            case "offline":
              statusColor = "bg-gray-100 text-gray-700";
              break;
          }

          return (
            <div
              key={p._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>

              <div className="flex gap-2 items-center">
                {/* Status Button */}
                <button
                  onClick={() => handleToggleStatus(p)}
                  className={`px-3 py-1 text-sm rounded ${statusColor}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePartner(p._id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p>No partners found.</p>
    )}
  </div>
)}



        {/* Deliveries */}
       {activeTab === "deliveries" && (
  <div>
    <h2 className="text-xl font-bold mb-4">Deliveries</h2>

    {loadingDeliveries ? (
      <p>Loading deliveries...</p>
    ) : deliveries?.length ? (
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Delivery ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Driver</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((d: any) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{d._id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {d.customerId?.email || d.customerId?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {d.driverId?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{d.deliveryStatus}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {Math.ceil(deliveries.length / ITEMS_PER_PAGE)}
          </span>

          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === Math.ceil(deliveries.length / ITEMS_PER_PAGE)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    ) : (
      <p>No deliveries found.</p>
    )}
  </div>
)}


    
    

   {/* Add Driver */}
{activeTab === "add-driver" && (
  <div>
    <h2 className="text-xl font-bold mb-6">Add New Driver</h2>

    <form onSubmit={handleCreatePartner}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {[
          "name",
          "email",
          "phone",
          "vehicleType",
          "vehicleNumber",
          "licenseNumber",
        ].map((field) => {
          // Vehicle Type dropdown
          if (field === "vehicleType") {
            return (
              <select
                key={field}
                value={(newPartner as any)[field] || ""}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, [field]: e.target.value })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            );
          }

          // Default input fields
          return (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={(newPartner as any)[field] || ""}
              onChange={(e) =>
                setNewPartner({ ...newPartner, [field]: e.target.value })
              }
              required={field !== "vehicleNumber" && field !== "licenseNumber"} // optional fields
            />
          );
        })}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Driver
        </button>
      </div>
    </form>
  </div>
)}



        {/* Update Partner */}
     {activeTab === "update-partner" && (
  <div>
    <h2 className="text-xl font-bold mb-6">Update Partner</h2>

    <form onSubmit={handleUpdatePartner}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {/* Select Partner */}
        <select
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.id}
          onChange={(e) => {
            const id = e.target.value;
            const p = partners?.find((x) => x._id === id);
            setUpdateForm({
              id,
              name: p?.name || "",
              email: p?.email || "",
              phone: p?.phone || "",
              currentStatus: p?.currentStatus || "available",
              vehicleType: p?.vehicleType || "",
              vehicleNumber: p?.vehicleNumber || "",
              licenseNumber: p?.licenseNumber || "",
            });
          }}
          required
        >
          <option value="">Select Partner</option>
          {partners?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.name}
          onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.email}
          onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
          required
        />

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.phone}
          onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
          required
        />

        {/* Current Status */}
        <select
          value={updateForm.currentStatus}
          onChange={(e) =>
            setUpdateForm({
              ...updateForm,
              currentStatus: e.target.value as "available" | "busy" | "offline",
            })
          }
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>

        {/* Vehicle Type */}
        <select
          value={updateForm.vehicleType}
          onChange={(e) => setUpdateForm({ ...updateForm, vehicleType: e.target.value })}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          <option value="">Select Vehicle Type</option>
          <option value="bike">Bike</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
        </select>

        {/* Vehicle Number */}
        <input
          type="text"
          placeholder="Vehicle Number"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.vehicleNumber}
          onChange={(e) => setUpdateForm({ ...updateForm, vehicleNumber: e.target.value })}
        />

        {/* License Number */}
        <input
          type="text"
          placeholder="License Number"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={updateForm.licenseNumber}
          onChange={(e) => setUpdateForm({ ...updateForm, licenseNumber: e.target.value })}
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Update Partner
        </button>
      </div>
    </form>
  </div>
)}



        {/* Assign Order */}
       {activeTab === "assign-order" && (
  <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl border border-gray-200 p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
      Assign Order to Driver
    </h2>

    <form onSubmit={handleAssignOrder} className="space-y-6">
      {/* Order Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Order
        </label>
        <select
          value={assignForm.orderId}
          onChange={(e) => {
            const selectedOrder = orderList.find(
              (o: any) => o._id === e.target.value
            );
            setAssignForm({
              ...assignForm,
              orderId: e.target.value,
              userId: selectedOrder?.userId?._id || "",
            });
          }}
          required
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select an Order</option>
          {orderList.map((o: any) => (
            <option key={o._id} value={o._id}>
              {o._id} — {o.subscriptionInfo?.planName ||
                o.subscriptionInfo?.planType ||
                "No Plan"}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Driver
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={assignForm.driverId}
          onChange={(e) =>
            setAssignForm({ ...assignForm, driverId: e.target.value })
          }
          required
        >
          <option value="">Select a Driver</option>
          {partners?.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-filled User */}
      {assignForm.userId && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Linked User ID
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-600"
            value={assignForm.userId}
            readOnly
          />
     

        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Assign Order
        </button>
      </div>
    </form>
  </div>
)}


        {/* View Partner */}
       {activeTab === "view-partner" && (
  <div>
    <h2 className="text-xl font-bold mb-6">View Delivery Partner</h2>

    {/* Partner Selection */}
    <select
      className="border p-2 rounded mb-6 w-full max-w-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      value={selectedPartnerId}
      onChange={(e) => setSelectedPartnerId(e.target.value)}
    >
      <option value="">Select a Partner</option>
      {partners?.map((p: any) => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>

    {/* Loading */}
    {loadingPartner ? (
      <p>Loading partner details...</p>
    ) : selectedPartner ? (
      <div className="p-6 border rounded-lg bg-white shadow-sm max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">{selectedPartner.name}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <p className="font-medium text-gray-600">Email:</p>
            <p className="text-gray-800">{selectedPartner.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Phone:</p>
            <p className="text-gray-800">{selectedPartner.phone}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Status:</p>
            <p
              className={`font-semibold ${
                selectedPartner.currentStatus === "available"
                  ? "text-green-600"
                  : selectedPartner.currentStatus === "busy"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {selectedPartner.currentStatus ?? "offline"}
            </p>
          </div>

          {/* Vehicle Info */}
          <div>
            <p className="font-medium text-gray-600">Vehicle Type:</p>
            <p className="text-gray-800">{selectedPartner.vehicleType || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Vehicle Number:</p>
            <p className="text-gray-800">{selectedPartner.vehicleNumber || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">License Number:</p>
            <p className="text-gray-800">{selectedPartner.licenseNumber || "N/A"}</p>
          </div>

          {/* Optional Notes */}
          {selectedPartner.notes && (
            <div className="md:col-span-2">
              <p className="font-medium text-gray-600">Notes:</p>
              <p className="text-gray-800">{selectedPartner.notes}</p>
            </div>
          )}

          {/* Delivery Stats */}
          {selectedPartner.stats && (
            <div className="md:col-span-2 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 rounded text-center">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="font-semibold text-gray-800">{selectedPartner.stats.completed || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded text-center">
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="font-semibold text-gray-800">{selectedPartner.stats.ongoing || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded text-center">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="font-semibold text-gray-800">{selectedPartner.stats.pending || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : (
      <p>No partner selected.</p>
    )}
  </div>
)}


        {/* Track Orders */}
        {/* Track Orders */}
{activeTab === "track-orders" && (
  <div>
    <h2 className="text-xl font-bold mb-4">Track Partner Orders</h2>

    {/* Select Driver */}
    <select
      className="border p-2 rounded mb-6"
      value={trackDriverId}
      onChange={(e) => {
        setTrackDriverId(e.target.value);
        setCurrentPage(1); // reset pagination on driver change
      }}
    >
      <option value="">Select a Driver</option>
      {partners?.map((p) => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>

    {loadingDriverOrders ? (
      <p>Loading orders...</p>
    ) : driverOrders?.length ? (
      <>
        {/* PAGINATION LOGIC */}
        {(() => {
          const ordersPerPage = 3;
          const totalPages = Math.ceil(driverOrders.length / ordersPerPage);
          const currentOrders = driverOrders.slice(
            (currentPage - 1) * ordersPerPage,
            currentPage * ordersPerPage
          );

          return (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-2">
                {currentOrders.map((order: any) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800 mb-1">
                        Order ID: {order._id}
                      </p>
                      <p className="text-sm text-gray-600">
                        User: {order.customerId?.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Plan:{" "}
                        {order.orderId?.subscriptionId?.planName ||
                          order.orderId?.subscriptionId?.planType ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Status: {order.deliveryStatus}
                      </p>

                      {order.orderId?.meals?.length ? (
                        <ul className="text-sm text-gray-500 space-y-1">
                          {order.orderId.meals.map((meal: any) => (
                            <li key={meal._id}>
                              {meal.slot}: {meal.productId?.name || "N/A"} (Qty:{" "}
                              {meal.quantity})
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {/* Update Status */}
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) =>
                        updateOrderStatus.mutate({
                          deliveryId: order._id,
                          status: e.target.value,
                        })
                      }
                      className="border p-2 rounded mt-4 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          );
        })()}
      </>
    ) : trackDriverId ? (
      <p>No orders assigned to this driver.</p>
    ) : (
      <p>Please select a driver to see assigned orders.</p>
    )}
  </div>
)}



      </div>
    </div>
  );
}
