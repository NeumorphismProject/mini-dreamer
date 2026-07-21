'use client';

import { useState } from 'react';
import { getLatestFile, downloadFile } from '@/lib/api';
import { toast } from 'sonner';

interface UseDownloadReturn {
  download: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * 下载逻辑 Hook
 * 处理应用下载的完整流程，包括API调用、错误处理和用户提示
 */
export function useDownload(): UseDownloadReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setLoading(true);
    setError(null);

    try {
      // 获取最新文件信息
      const result = await getLatestFile();

      // 生成文件名：抽象吧桌宠_v1.0.0.exe
      const fileName = `抽象吧桌宠_${result.file_version}.exe`;

      // 触发浏览器下载
      await downloadFile(result.download_url, fileName);

      // 显示成功提示（绿色，2秒）
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

      // 显示错误提示（橙色，3秒）
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