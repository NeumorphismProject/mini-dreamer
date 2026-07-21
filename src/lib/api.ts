import type { DownloadResponse } from '@/types';

export async function getLatestFile(): Promise<DownloadResponse> {
  try {
    const response = await fetch('/api/download', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    const data = await response.json();
    return data as DownloadResponse;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export async function downloadFile(url: string, fileName: string): Promise<void> {
  try {
    // 通过代理接口下载文件（避免 CORS）
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;

    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch {
    throw new Error('下载失败，请稍后重试');
  }
}