'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRoles, getRoleImageUrl } from '@/lib/api';
import type { ListRolesResponse, ListRolesParams, Role } from '@/types';

interface UseRolesReturn {
  data: ListRolesResponse | null;
  loading: boolean;
  loadingImages: boolean;
  error: string | null;
  refetch: (params?: ListRolesParams) => Promise<void>;
}

const BATCH_SIZE = 5;

async function fetchImageUrlsInBatches(roles: Role[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const imageKeys = roles.map(role => role.role_image_key);

  for (let i = 0; i < imageKeys.length; i += BATCH_SIZE) {
    const batch = imageKeys.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(key => getRoleImageUrl(key))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.download_url) {
        results.set(batch[index], result.value.download_url);
      }
    });
  }

  return results;
}

export function useRoles(initialParams: ListRolesParams = {}): UseRolesReturn {
  const [data, setData] = useState<ListRolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: ListRolesParams = {}) => {
    setLoading(true);
    setLoadingImages(false);
    setError(null);

    try {
      const result = await getRoles(params);

      if (result.records.length > 0) {
        setLoadingImages(true);
        try {
          const imageUrlMap = await fetchImageUrlsInBatches(result.records);

          const recordsWithUrls = result.records.map(role => ({
            ...role,
            role_image_url: imageUrlMap.get(role.role_image_key) || undefined,
          }));

          setData({ ...result, records: recordsWithUrls });
        } finally {
          setLoadingImages(false);
        }
      } else {
        setData(result);
      }
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

  return { data, loading, loadingImages, error, refetch: fetchData };
}