// ============ API 请求/响应类型 ============
import type { ErrorInfo } from './audio';

export interface ApiRequest<T = unknown> {
  action: string;
  params?: T;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  run_id?: string;
}

// API 方法返回类型（包含 success 状态）
export interface ApiResult<T = unknown> {
  success: boolean;
  data: T;
  error?: ErrorInfo;
}
