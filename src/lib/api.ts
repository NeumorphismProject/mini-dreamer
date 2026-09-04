import type { DownloadResponse, ListRolesParams, ListRolesResponse, ArchiveUrlResponse, ImageUrlResponse, ListToolFilesParams, ListToolFilesResponse, ToolFileUrlResponse } from '@/types';

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

export async function getLatestCutappFile(): Promise<DownloadResponse> {
  try {
    const response = await fetch('/api/cutapp-download', {
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

export function downloadFile(url: string): void {
  window.open(url, '_blank');
}

export async function getRoles(params: ListRolesParams = {}): Promise<ListRolesResponse> {
  const { page = 1, page_size = 10, keyword = '' } = params;
  const query = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
    keyword,
  });

  try {
    const response = await fetch(`/api/roles?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export async function getRoleImageUrl(imageKey: string): Promise<ImageUrlResponse> {
  try {
    const response = await fetch(`/api/role/image?image_key=${encodeURIComponent(imageKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export async function getRoleArchiveUrl(archiveKey: string): Promise<ArchiveUrlResponse> {
  try {
    const response = await fetch(`/api/role/archive?archive_key=${encodeURIComponent(archiveKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export async function listToolFiles(params: ListToolFilesParams = {}): Promise<ListToolFilesResponse> {
  const { page = 1, page_size = 10, keyword = '', tool_type = '' } = params;
  const query = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });
  if (keyword) query.set('keyword', keyword);
  if (tool_type) query.set('tool_type', tool_type);

  try {
    const response = await fetch(`/api/tool/files?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export async function getToolFileUrl(storageKey: string): Promise<ToolFileUrlResponse> {
  try {
    const response = await fetch(`/api/tool/file-url?storage_key=${encodeURIComponent(storageKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}