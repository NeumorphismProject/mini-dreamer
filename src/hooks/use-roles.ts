'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRoles } from '@/lib/api';
import type { ListRolesResponse, ListRolesParams } from '@/types';

interface UseRolesReturn {
  data: ListRolesResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: ListRolesParams) => Promise<void>;
}

export function useRoles(initialParams: ListRolesParams = {}): UseRolesReturn {
  const [data, setData] = useState<ListRolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: ListRolesParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRoles(params);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取角色列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(initialParams);
  }, []);

  return { data, loading, error, refetch: fetchData };
}