// 下载响应类型
export interface DownloadResponse {
  id: number;
  file_name: string;
  file_version: string;
  storage_key: string;
  download_url: string;
  url_expire_time: string;
  created_at: string;
  updated_at: string;
}

// API 错误类型
export interface ApiError {
  error: string;
}

// API 响应类型
export interface ApiResponse {
  result: DownloadResponse | Record<string, never>;
  error: string;
}