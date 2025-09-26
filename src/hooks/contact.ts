import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, getContactById, addContact, updateContact } from "../api/contact";
import type { IContact } from "../types/contact";

// ✅ Fetch all contacts
export const useContacts = () => {
  return useQuery<IContact[], Error>({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });
};

// ✅ Fetch single contact
export const useContact = (id: string) => {
  return useQuery<IContact, Error>({
    queryKey: ["contact", id],
    queryFn: () => getContactById(id),
    enabled: !!id, // prevents running if id is empty/null
  });
};



export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation<IContact, Error, { id: string; contact: Partial<IContact> }>({
    mutationFn: ({ id, contact }) => updateContact(id, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation<IContact, Error, Partial<IContact>>({
    mutationFn: (newContact) => addContact(newContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

