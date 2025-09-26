import { useState, useMemo } from "react";
import {
  useContacts,
  useAddContact,
  useUpdateContact,
} from "../../hooks/contact";
import { type IContact } from "../../types/contact";
import { FiSearch, FiUsers, FiX, FiPlus, FiEdit } from "react-icons/fi";

export default function Contact() {
  const { data: contacts = [], isLoading, isError, error } = useContacts();
  const addMutation = useAddContact();
  const updateMutation = useUpdateContact();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);

  const contactsPerPage = 8;

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const indexOfLast = currentPage * contactsPerPage;
  const indexOfFirst = indexOfLast - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<IContact> = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phoneNumbers: (formData.get("phoneNumbers") as string)
        ?.split(",")
        .map((p) => p.trim()),
      address: formData.get("address") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    if (editingContact) {
      updateMutation.mutate(
        { id: editingContact._id, contact: data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingContact(null);
          },
        }
      );
    } else {
      addMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading contacts...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error?.message || "Failed to load contacts"}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow border">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Contact Messages</h2>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setEditingContact(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiPlus /> Add Contact
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Subject
                </th>
                <th className="w-32 px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentContacts.length > 0 ? (
                currentContacts.map((contact, idx) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {indexOfFirst + idx + 1}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">
                      {contact.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {contact.subject}
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setIsModalOpen(true);
                        }}
                        className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-lg hover:bg-yellow-100 text-sm font-medium flex items-center gap-1"
                      >
                        <FiEdit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <FiUsers className="mx-auto mb-2 text-gray-400 w-6 h-6" />
                    {searchTerm ? "No contacts found" : "No messages available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 px-4 py-3 border-t">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Message Details</h3>
            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {selectedContact.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedContact.email}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedContact.phoneNumbers?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedContact.address}
              </p>
              <p>
                <strong>Subject:</strong> {selectedContact.subject}
              </p>
              <p>
                <strong>Message:</strong> {selectedContact.message}
              </p>
              <p className="text-sm text-gray-500">
                Sent on {new Date(selectedContact.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full p-6 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingContact(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Name"
                  defaultValue={editingContact?.name || ""}
                  required
                  className="p-2 border rounded-lg w-full"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={editingContact?.email || ""}
                  required
                  className="p-2 border rounded-lg w-full"
                />
              </div>
              <input
                name="phoneNumbers"
                placeholder="Phone Numbers (comma separated)"
                defaultValue={editingContact?.phoneNumbers?.join(", ") || ""}
                className="p-2 border rounded-lg w-full"
              />
              <input
                name="address"
                placeholder="Address"
                defaultValue={editingContact?.address || ""}
                required
                className="p-2 border rounded-lg w-full"
              />
              <input
                name="subject"
                placeholder="Subject"
                defaultValue={editingContact?.subject || ""}
                required
                className="p-2 border rounded-lg w-full"
              />
              <textarea
                name="message"
                placeholder="Message"
                defaultValue={editingContact?.message || ""}
                required
                className="p-2 border rounded-lg w-full"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingContact ? "Update Contact" : "Add Contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
