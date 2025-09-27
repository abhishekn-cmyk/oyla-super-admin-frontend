import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, getContactById, addContact, updateContact } from "../api/contact";
import type { IContact } from "../types/contact";
import { toast } from "react-toastify";

// ✅ Fetch all contacts
export const useContacts = () => {
  return useQuery<IContact[], Error>({
    queryKey: ["contacts"],
    queryFn: async () => {
      try {
        return await getContacts();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch contacts");
        throw err;
      }
    },
  });
};

// ✅ Fetch single contact
export const useContact = (id: string) => {
  return useQuery<IContact, Error>({
    queryKey: ["contact", id],
    queryFn: async () => {
      try {
        return await getContactById(id);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch contact");
        throw err;
      }
    },
    enabled: !!id, // prevents running if id is empty/null
  });
};

// ✅ Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation<IContact, Error, { id: string; contact: Partial<IContact> }>({
    mutationFn: ({ id, contact }) => updateContact(id, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update contact");
    },
  });
};

// ✅ Add contact
export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation<IContact, Error, Partial<IContact>>({
    mutationFn: (newContact) => addContact(newContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add contact");
    },
  });
};
