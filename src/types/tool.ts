export interface ToolFile {
  id: number;
  file_name: string;
  tool_type: string;
  storage_key: string;
  link?: string;
  desc?: string;
  /** 评分（0~10 分，5 星制：星数 = score / 2），缺失或异常时展示 5 颗灰星 */
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface ListToolFilesParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  tool_type?: string;
  /** 评分下限过滤（score >= score_min） */
  score_min?: number;
  /** 评分上限过滤（score <= score_max） */
  score_max?: number;
}

export interface ListToolFilesResponse {
  records: ToolFile[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ToolFileUrlResponse {
  storage_key: string;
  download_url: string;
  url_expire_time: string;
}