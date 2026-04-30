'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardData, ApiResponse } from '@/types/ticket';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>('/dashboard');
      return data;
    },
  });
}