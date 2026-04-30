'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Ticket, TicketFormData, ApiResponse } from '@/types/ticket';

export function useTickets(params?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Ticket[]>>('/tickets', { params });
      return data;
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: TicketFormData) => {
      const { data } = await api.post<ApiResponse<Ticket>>('/tickets', ticketData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Ticket> & { id: number }) => {
      const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id.toString()] });
    },
  });
}