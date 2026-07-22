export interface Role {
  id: number;
  role_name: string;
  role_image_key: string;
  role_archive_key: string;
  created_at: string;
  updated_at: string;
  role_image_url: string;
}

export interface ListRolesParams {
  page?: number;
  page_size?: number;
  keyword?: string;
}

export interface ListRolesResponse {
  records: Role[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ArchiveUrlResponse {
  archive_key: string;
  download_url: string;
  url_expire_time: string;
}