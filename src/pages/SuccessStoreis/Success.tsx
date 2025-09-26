import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  useSuccessStories,
  useCreateSuccessStory,
  useUpdateSuccessStory,
  useDeleteSuccessStory,
  type SuccessStory,
} from "../../hooks/usesuccess";
import { Plus, Edit, Trash2, Eye, Calendar, User, Award, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 6;

export default function Success() {
  const { data: stories = [], isLoading, isError, error } = useSuccessStories();
  const createMutation = useCreateSuccessStory();
  const updateMutation = useUpdateSuccessStory();
  const deleteMutation = useDeleteSuccessStory();

  const [form, setForm] = useState({
    title: "",
    description: "",
    author: "",
    role: "",
    image: null as File | null,
  });
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingStory, setViewingStory] = useState<SuccessStory | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", author: "", role: "", image: null });
    setEditingId(null);
    setExistingImage(null);
    setShowModal(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("author", form.author);
    formData.append("role", form.role);
    if (form.image) formData.append("image", form.image);

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, story: formData },
        {
          onSuccess: () => {
            toast.success("Story updated successfully!");
            resetForm();
          },
          onError: (err: any) => {
            console.error(err);
            toast.error(err?.message || "Failed to update story.");
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Story created successfully!");
          resetForm();
        },
        onError: (err: any) => {
          console.error(err);
          toast.error(err?.message || "Failed to create story.");
        },
      });
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingId(story._id);
    setForm({
      title: story.title,
      description: story.description,
      author: story.author || "",
      role: story.role || "",
      image: null,
    });
    setExistingImage(story.image || null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this success story?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Story deleted successfully!");
        }
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(stories.length / ITEMS_PER_PAGE);
  const paginatedStories = stories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading success stories...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stories</h3>
          <p className="text-red-500 text-sm">{error?.message || "Failed to load success stories"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="d-flex">
        {/* Header Section */}
       {/* Header Section */}
<div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 w-full">
  {/* Left side: Heading */}
  <div className="flex flex-col text-center lg:text-left">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
        <Award className="text-white text-2xl" />
      </div>
      Success Stories
    </h1>
    <p className="text-gray-600 mt-2">
      Share inspiring stories of achievement and success
    </p>
  </div>

  {/* Right side: Button */}
  <button
    onClick={() => setShowModal(true)}
    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl w-full lg:w-auto justify-center lg:ml-auto"
  >
    <Plus size={20} /> Add Success Story
  </button>
</div>



        {/* Stats Cards */}
        <div className="grid grid-cols-4 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Stories</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stories.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Award className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Stories</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stories.filter(story => story.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Eye className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stories.filter(story => 
                    new Date(story.date).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Calendar className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-blue-600" />
              Success Stories Management
            </h2>
          </div>

          {/* Stories List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Story
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStories.length > 0 ? (
                  paginatedStories.map((story) => (
                    <tr key={story._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                            {story.image ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL}/${story.image}`}
                                alt={story.title}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            ) : (
                              <ImageIcon className="text-blue-600 w-6 h-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {story.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {story.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400 w-4 h-4" />
                          <div>
                            <p className="font-medium text-gray-900">{story.author}</p>
                            {story.role && (
                              <p className="text-xs text-gray-500">{story.role}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(story.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          story.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {story.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingStory(story)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                            title="View story"
                          >
                            <Eye className="group-hover/btn:scale-110 transition-transform w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(story)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors group/btn"
                            title="Edit story"
                          >
                            <Edit className="group-hover/btn:scale-110 transition-transform w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(story._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group/btn"
                            title="Delete story"
                          >
                            <Trash2 className="group-hover/btn:scale-110 transition-transform w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No success stories yet</h3>
                        <p className="text-gray-500 mb-4">Get started by sharing your first success story</p>
                        <button
                          onClick={() => setShowModal(true)}
                          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                        >
                          Create First Story
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, stories.length)}</span> of{" "}
                <span className="font-semibold">{stories.length}</span> stories
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border transition-colors text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="text-blue-600" />
                {editingId ? "Edit Success Story" : "Add Success Story"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        placeholder="Enter an inspiring title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        placeholder="Share the inspiring story details..."
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-vertical"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Author Name *
                        </label>
                        <input
                          type="text"
                          name="author"
                          placeholder="Author name"
                          value={form.author}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role/Position
                        </label>
                        <input
                          type="text"
                          name="role"
                          placeholder="e.g., CEO, Student, etc."
                          value={form.role}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <div className="max-w-xs mx-auto">
                          {(existingImage && !form.image) ? (
                            <div className="space-y-4">
                              <img
                                src={`${import.meta.env.VITE_API_URL}/${existingImage}`}
                                alt="Current"
                                className="w-full h-48 object-cover rounded-lg mx-auto"
                              />
                              <p className="text-sm text-gray-500">Current image</p>
                            </div>
                          ) : form.image ? (
                            <div className="space-y-4">
                              <img
                                src={URL.createObjectURL(form.image)}
                                alt="New"
                                className="w-full h-48 object-cover rounded-lg mx-auto"
                              />
                              <p className="text-sm text-gray-500">New image preview</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-gray-600">Click to upload an image</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                              </div>
                            </div>
                          )}
                          
                          <label className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            Choose Image
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

           <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
  <button
    onClick={resetForm}
    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
  >
    Cancel
  </button>
  <button
    onClick={handleSubmit}
    disabled={createMutation.isPending || updateMutation.isPending}
    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {createMutation.isPending || updateMutation.isPending ? (
      <span className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        {editingId ? "Updating..." : "Creating..."}
      </span>
    ) : editingId ? (
      "Update Story"
    ) : (
      "Create Story"
    )}
  </button>
</div>

          </div>
        </div>
      )}

      {/* View Story Modal */}
      {viewingStory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Story Details</h2>
              <button
                onClick={() => setViewingStory(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {viewingStory.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${viewingStory.image}`}
                    alt={viewingStory.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingStory.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{viewingStory.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Author</p>
                      <p className="font-medium">{viewingStory.author}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Award className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{viewingStory.role || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(viewingStory.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Eye className="text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        viewingStory.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingStory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingStory(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEdit(viewingStory);
                  setViewingStory(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}