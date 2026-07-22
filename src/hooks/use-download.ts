'use client';

import { useState } from 'react';
import { getLatestFile, downloadFile } from '@/lib/api';
import { toast } from 'sonner';

interface UseDownloadReturn {
  download: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useDownload(): UseDownloadReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLatestFile();
      downloadFile(result.download_url);

      toast.success('下载已开始，请查看浏览器下载列表', {
        duration: 2000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '下载失败，请稍后重试';
      setError(errorMessage);

      toast.error(errorMessage, {
        duration: 3000,
        style: {
          background: '#F59E0B',
          color: 'white',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { download, loading, error };
}