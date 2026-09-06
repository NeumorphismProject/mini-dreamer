export interface ToolFile {
  id: number;
  file_name: string;
  tool_type: string;
  storage_key: string;
  link?: string;
  desc?: string;
  created_at: string;
  updated_at: string;
}

export interface ListToolFilesParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  tool_type?: string;
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