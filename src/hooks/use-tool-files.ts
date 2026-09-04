'use client';

import { useState, useEffect, useCallback } from 'react';
import { listToolFiles } from '@/lib/api';
import type { ListToolFilesResponse, ListToolFilesParams } from '@/types';

interface UseToolFilesReturn {
  data: ListToolFilesResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: ListToolFilesParams) => Promise<void>;
}

export function useToolFiles(initialParams: ListToolFilesParams = {}): UseToolFilesReturn {
  const [data, setData] = useState<ListToolFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: ListToolFilesParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listToolFiles(params);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取工具文件列表失败';
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