import { apiClient } from './client';
import type { TagItem } from '@/types';

// ============ 响应类型 ============

// 批量操作响应
interface BatchOperationResponse {
  success: boolean;
  message: string;
  total_count: number;
  deleted_count?: number;
  restored_count?: number;
  failed_count: number;
  details: {
    id?: number;
    tag_id?: number;
    status?: 'success' | 'failed';
    error?: string;
  }[];
}

// 清理响应
interface CleanupResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

// ============ API 方法 ============

export const tagApi = {
  // ============ 标签管理 ============

  /**
   * 查询标签列表
   * @param params page, page_size, tag_name, description
   */
  queryTags: (params?: {
    page?: number;
    page_size?: number;
    tag_name?: string;
    description?: string;
  }): Promise<{
    total: number;
    page: number;
    page_size: number;
    list: TagItem[];
  }> => apiClient.request('query_tags', params || {}),

  /**
   * 创建标签
   */
  createTag: (params: {
    tag_name: string;
    description?: string;
  }): Promise<TagItem> => apiClient.request<TagItem>('create_tag', params),

  /**
   * 更新标签
   */
  updateTag: (params: {
    id: number;
    tag_name?: string;
    description?: string;
  }): Promise<TagItem> => apiClient.request<TagItem>('update_tag', params),

  /**
   * 批量软删除标签（只允许删除没有音频关联的标签）
   */
  softDeleteTags: (ids: number[]): Promise<BatchOperationResponse> =>
    apiClient.request('soft_delete_tags', { ids }),

  /**
   * 查询软删除标签
   */
  queryDeletedTags: (params?: {
    page?: number;
    page_size?: number;
    tag_name?: string;
    description?: string;
  }): Promise<{
    total: number;
    page: number;
    page_size: number;
    list: TagItem[];
  }> => apiClient.request('query_deleted_tags', params || {}),

  /**
   * 批量恢复标签
   */
  restoreTags: (ids: number[]): Promise<BatchOperationResponse> =>
    apiClient.request('restore_tags', { ids }),

  /**
   * 清理软删除标签（只清理没有音频关联的标签）
   */
  cleanupDeletedTags: (): Promise<CleanupResponse> =>
    apiClient.request('cleanup_deleted_tags', {}),

  // ============ 标签-音频关联 ============

  /**
   * 查询音频的标签
   */
  queryAudioTags: (fileName: string): Promise<{
    file_name: string;
    tags: TagItem[];
  }> => apiClient.request('query_audio_tags', { file_name: fileName }),

  /**
   * 批量添加音频标签
   * @param fileName 文件名（跨3张表的唯一标识）
   * @param tagIds 标签ID数组
   */
  addAudioTagsBatch: (fileName: string, tagIds: number[]): Promise<{
    message: string;
    total_count: number;
    success_count: number;
    failed_count: number;
    details: {
      tag_id: number;
      status: 'success' | 'failed';
      error?: string;
    }[];
  }> =>
    apiClient.request('add_audio_tags_batch', {
      file_name: fileName,
      tag_ids: tagIds.join(','),
    }),

  /**
   * 删除音频标签
   */
  deleteAudioTag: (fileName: string, tagId: number): Promise<{ message: string }> =>
    apiClient.request('delete_audio_tag', { file_name: fileName, tag_id: tagId }),
};
