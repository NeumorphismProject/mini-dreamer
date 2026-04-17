import { apiClient } from './client';
import type {
  GenerateParams,
  GenerateResponse,
  SaveParams,
  SaveResponse,
  QueryParams,
  ListResponse,
  AudioItem,
  ErrorInfo,
} from '@/types';

// ============ 响应类型 ============

interface MoveToTempResponse {
  message: string;
}

// 删除临时音频响应
interface DeleteTempAudioResponse {
  message: string;
  marked_count: number;
  details: {
    temp_id: number;
    status: 'success' | 'failed';
    error?: string;
  }[];
}

// 清理临时音频响应
interface CleanupTempAudioResponse {
  message: string;
  total_checked: number;
  deleted_count: number;
  failed_count: number;
  failed_details: {
    temp_id: number;
    audio_url: string;
    file_unique_key: string;
    error: string;
  }[];
}

// 重试清理音频响应
interface RetryCleanupAudioResponse {
  message: string;
  total_checked: number;
  deleted_count: number;
  failed_count: number;
  failed_details: {
    file_url: string;
    error: string;
  }[];
}

// 查询软删除临时音频响应
interface QueryDeletedTempAudioResponse {
  total: number;
  page: number;
  page_size: number;
  list: {
    id: number;
    audio_url: string;
    file_name: string;
    description: string;
    deleted_at: string;
    audio_duration: number;
    file_size: number;
    file_format: string;
    style_type: string;
    is_edited: boolean;
    original_audio_id: number;
  }[];
}

// 恢复软删除临时音频响应
interface RestoreDeletedTempAudioResponse {
  message: string;
  restored_count: number;
  details: {
    temp_id: number;
    status: 'success' | 'failed';
    error?: string;
  }[];
}

// ============ 请求参数类型 ============

// 查询列表参数（通用）
interface QueryAudioParams {
  page?: number;
  page_size?: number;
  file_name?: string;
  file_format?: string;
  audio_duration_min?: number;
  audio_duration_max?: number;
  file_size_min?: number;
  file_size_max?: number;
  style_type?: string;
  description?: string;
  update_time_min?: string;
  tag_ids?: number[]; // 标签ID列表
}

// 临时音频查询参数（特殊字段）
interface QueryTempAudioParams extends Omit<QueryAudioParams, 'update_time_min'> {
  created_at_min?: string;
}

// 精品音效查询参数
interface QueryPremiumSoundEffectsParams {
  page?: number;
  page_size?: number;
  file_name?: string;
  file_format?: string;
  audio_duration_min?: number;
  audio_duration_max?: number;
  file_size_min?: number;
  file_size_max?: number;
  style_type?: string;
  tag_ids?: number[]; // 标签ID列表
}

// 批量转移到精品音效库响应
interface MoveToPremiumLibraryResponse {
  message: string;
  total_count: number;
  moved_count: number;
  failed_count: number;
  details: {
    id: number;
    status: 'success' | 'failed';
    error?: string;
  }[];
}

// 批量恢复到音效库响应
interface RestoreFromPremiumLibraryResponse {
  message: string;
  total_count: number;
  restored_count: number;
  failed_count: number;
  details: {
    id: number;
    status: 'success' | 'failed';
    error?: string;
  }[];
}

// 优化提示词响应
interface OptimizePromptResponse {
  original_prompt: string;
  optimized_prompt: string;
  improvements: string[];
}

// 源媒体信息
interface SourceMedia {
  file_name: string;
  media_type: 'image' | 'video';
  media_url: string;
  permanent_url?: string;
  created_at: string;
}

// 查询音频源图片响应
interface QueryAudioSourceImageResponse {
  audio_file_name: string;
  source_image: SourceMedia | null;
}

// 查询音频源视频响应
interface QueryAudioSourceVideoResponse {
  audio_file_name: string;
  source_video: SourceMedia | null;
}

// ============ API 方法 ============

// 将 tag_ids 数组转换为逗号分隔的字符串
function formatTagIds(tagIds?: number[]): string | undefined {
  if (!tagIds || tagIds.length === 0) return undefined;
  return tagIds.join(',');
}

export const audioApi = {
  // 生成音频
  generateAudio: (params: GenerateParams): Promise<GenerateResponse> =>
    apiClient.request<GenerateResponse>('generate_audio', params),

  // 保存音频
  saveAudio: (params: SaveParams): Promise<SaveResponse> =>
    apiClient.request<SaveResponse>('save_audio', params),

  // 查询音效列表
  querySoundEffects: (params?: QueryAudioParams): Promise<ListResponse<AudioItem>> => {
    const { tag_ids, ...rest } = params || {};
    return apiClient.request<ListResponse<AudioItem>>('query_sound_effects', {
      ...rest,
      tag_ids: formatTagIds(tag_ids),
    });
  },

  // 查询临时音频列表
  queryTempAudio: (params?: QueryTempAudioParams): Promise<ListResponse<AudioItem>> => {
    const { tag_ids, ...rest } = params || {};
    return apiClient.request<ListResponse<AudioItem>>('query_temp_audio', {
      ...rest,
      tag_ids: formatTagIds(tag_ids),
    });
  },

  // 移动音效到临时表
  moveToTemp: (id: number): Promise<MoveToTempResponse> =>
    apiClient.request<MoveToTempResponse>('move_sound_effect_to_temp', { id }),

  // 删除临时音频（软删除）
  deleteTempAudio: (tempIds: number[]): Promise<DeleteTempAudioResponse> =>
    apiClient.request<DeleteTempAudioResponse>('delete_temp_audio', { temp_ids: tempIds }),

  // 清理临时音频（真删除）
  cleanupTempAudio: (limit?: number): Promise<CleanupTempAudioResponse> =>
    apiClient.request<CleanupTempAudioResponse>('cleanup_temp_audio', { limit }),

  // 重试清理音频
  retryCleanupAudio: (fileUrls: string[]): Promise<RetryCleanupAudioResponse> =>
    apiClient.request<RetryCleanupAudioResponse>('retry_cleanup_audio', { file_urls: fileUrls }),

  // 查询软删除临时音频
  queryDeletedTempAudio: (params?: {
    page?: number;
    page_size?: number;
    file_name?: string;
    description?: string;
  }): Promise<QueryDeletedTempAudioResponse> =>
    apiClient.request<QueryDeletedTempAudioResponse>('query_deleted_temp_audio', params || {}),

  // 恢复软删除临时音频
  restoreDeletedTempAudio: (tempIds: number[]): Promise<RestoreDeletedTempAudioResponse> =>
    apiClient.request<RestoreDeletedTempAudioResponse>('restore_deleted_temp_audio', { temp_ids: tempIds }),

  // 查询精品音效列表
  queryPremiumSoundEffects: (params?: QueryPremiumSoundEffectsParams): Promise<ListResponse<AudioItem>> => {
    const { tag_ids, ...rest } = params || {};
    return apiClient.request<ListResponse<AudioItem>>('query_premium_sound_effects', {
      ...rest,
      tag_ids: formatTagIds(tag_ids),
    });
  },

  // 批量转移到精品音效库
  moveToPremiumLibrary: (ids: number[]): Promise<MoveToPremiumLibraryResponse> =>
    apiClient.request<MoveToPremiumLibraryResponse>('move_to_premium_library', { ids }),

  // 批量恢复到音效库
  restoreFromPremiumLibrary: (ids: number[]): Promise<RestoreFromPremiumLibraryResponse> =>
    apiClient.request<RestoreFromPremiumLibraryResponse>('restore_from_premium_library', { ids }),

  // 为音频添加/更新标签（跨3张表）
  addTagsToAudio: (fileName: string, tagIds: number[]): Promise<{ message: string; total_count?: number; success_count?: number; failed_count?: number }> =>
    apiClient.request('add_audio_tags_batch', { file_name: fileName, tag_ids: tagIds.join(',') }),

  // 优化提示词
  optimizePrompt: (originalPrompt: string): Promise<OptimizePromptResponse> =>
    apiClient.request<OptimizePromptResponse>('optimize_prompt_for_audio', { original_prompt: originalPrompt }),

  // 查询音频源图片
  queryAudioSourceImage: (fileName: string): Promise<QueryAudioSourceImageResponse> =>
    apiClient.request<QueryAudioSourceImageResponse>('query_audio_source_image', { file_name: fileName }),

  // 查询音频源视频
  queryAudioSourceVideo: (fileName: string): Promise<QueryAudioSourceVideoResponse> =>
    apiClient.request<QueryAudioSourceVideoResponse>('query_audio_source_video', { file_name: fileName }),
};

export type { QueryAudioParams, QueryTempAudioParams, QueryPremiumSoundEffectsParams, OptimizePromptResponse, SourceMedia, QueryAudioSourceImageResponse, QueryAudioSourceVideoResponse };
