"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "../endpoints";
import { queryKeys } from "../query-keys";

export function useContacts() {
  return useInfiniteQuery({
    queryKey: queryKeys.contacts,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => contactsApi.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.contact(id) : queryKeys.contacts,
    queryFn: () => contactsApi.get(id as string),
    enabled: !!id,
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts }),
  });
}
