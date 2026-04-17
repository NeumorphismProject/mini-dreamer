import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiRequest, ApiResponse, ErrorInfo } from '@/types';

// 扩展的错误信息类型，支持批量操作的详情
export interface ExtendedErrorInfo extends ErrorInfo {
  details?: Array<{ id?: number; error?: string }>;
  errorMessage?: string; // 从 details 中提取的错误信息
}

// API 客户端类
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 300000, // 5分钟，用于音频生成
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 可添加鉴权token等
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        // 不再自动 reject，让业务代码自行处理 success: false 的情况
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        // 处理网络错误
        if (error.response) {
          // 服务器返回错误
          const data = error.response.data;
          if (data?.error) {
            return Promise.reject(data.error);
          }
        }
        return Promise.reject({
          code: 'NETWORK_ERROR',
          message: error.message || '网络请求失败',
        } as ErrorInfo);
      }
    );
  }

  // 通用请求方法，返回包含 success 状态的完整结果
  async request<T>(action: string, params?: unknown): Promise<T & { success?: boolean }> {
    const requestData: ApiRequest = { action, params };
    const response = await this.client.post<ApiResponse<T>>('', requestData);

    // 如果 success 为 false，抛出错误信息
    if (!response.data.success) {
      // 优先使用顶层 error 字段
      if (response.data.error) {
        return Promise.reject(response.data.error);
      }

      // 从 data 中提取错误信息（批量操作的场景）
      const data = response.data.data as Record<string, unknown> | undefined;
      if (data) {
        // 提取 details 中的错误信息
        const details = data.details as Array<{ id?: number; error?: string }> | undefined;
        const errorMessages = details
          ?.filter((d) => d.error)
          .map((d) => d.error)
          .join('；');

        const error: ExtendedErrorInfo = {
          code: 'OPERATION_FAILED',
          message: (data.message as string) || '操作失败',
          details: details,
          errorMessage: errorMessages,
        };
        return Promise.reject(error);
      }

      return Promise.reject({ code: 'UNKNOWN_ERROR', message: '请求失败' } as ErrorInfo);
    }

    // 将 success 状态合并到返回的 data 中
    return {
      ...response.data.data,
      success: response.data.success,
    } as T & { success?: boolean };
  }
}

// 创建 API 客户端实例
// 通过 Next.js API 代理访问后端
export const apiClient = new ApiClient('/api/proxy');

export default apiClient;
