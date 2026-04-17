import { create } from 'zustand';
import type { TagItem } from '@/types';
import { tagApi } from '@/services/api';

interface TagState {
  // 标签列表
  tags: TagItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  searchName: string;

  // 选中的标签（用于筛选）
  selectedTagIds: number[];

  // 软删除标签（回收站）
  deletedTags: TagItem[];
  deletedTotal: number;
  deletedPage: number;
  deletedSearchName: string;
  isDeletedLoading: boolean;

  // Actions - 标签列表
  fetchTags: (params?: { page?: number; tag_name?: string }) => Promise<void>;
  fetchMoreTags: () => Promise<void>;
  setSearchName: (name: string) => void;
  searchTags: (name: string) => Promise<void>;

  // Actions - 筛选
  setSelectedTagIds: (ids: number[]) => void;
  toggleTagId: (id: number) => void;
  clearSelectedTags: () => void;

  // Actions - 软删除标签
  fetchDeletedTags: (params?: { page?: number; tag_name?: string }) => Promise<void>;
  fetchMoreDeletedTags: () => Promise<void>;
  setDeletedSearchName: (name: string) => void;
  searchDeletedTags: (name: string) => Promise<void>;

  // Actions - 通用
  reset: () => void;
  refreshTags: () => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  // 初始状态
  tags: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  searchName: '',
  selectedTagIds: [],
  deletedTags: [],
  deletedTotal: 0,
  deletedPage: 1,
  deletedSearchName: '',
  isDeletedLoading: false,

  // ============ 标签列表 ============

  fetchTags: async (params) => {
    set({ isLoading: true });
    try {
      const { pageSize, searchName } = get();
      const result = await tagApi.queryTags({
        page: params?.page || 1,
        page_size: pageSize,
        tag_name: params?.tag_name ?? (searchName || undefined),
      });
      set({
        tags: result.list,
        total: result.total,
        page: result.page,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      set({ isLoading: false });
    }
  },

  fetchMoreTags: async () => {
    const { page, pageSize, tags, isLoading, searchName } = get();
    if (isLoading) return;

    const nextPage = page + 1;
    set({ isLoading: true });
    try {
      const result = await tagApi.queryTags({
        page: nextPage,
        page_size: pageSize,
        tag_name: searchName || undefined,
      });
      set({
        tags: [...tags, ...result.list],
        total: result.total,
        page: nextPage,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch more tags:', error);
      set({ isLoading: false });
    }
  },

  setSearchName: (name) => set({ searchName: name }),

  searchTags: async (name) => {
    set({ searchName: name, page: 1 });
    await get().fetchTags({ page: 1, tag_name: name });
  },

  // ============ 筛选 ============

  setSelectedTagIds: (ids) => set({ selectedTagIds: ids }),

  toggleTagId: (id) => {
    const { selectedTagIds } = get();
    if (selectedTagIds.includes(id)) {
      set({ selectedTagIds: selectedTagIds.filter((i) => i !== id) });
    } else {
      set({ selectedTagIds: [...selectedTagIds, id] });
    }
  },

  clearSelectedTags: () => set({ selectedTagIds: [] }),

  // ============ 软删除标签 ============

  fetchDeletedTags: async (params) => {
    set({ isDeletedLoading: true });
    try {
      const { deletedSearchName } = get();
      const result = await tagApi.queryDeletedTags({
        page: params?.page || 1,
        page_size: 20,
        tag_name: params?.tag_name ?? (deletedSearchName || undefined),
      });
      set({
        deletedTags: result.list,
        deletedTotal: result.total,
        deletedPage: result.page,
        isDeletedLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch deleted tags:', error);
      set({ isDeletedLoading: false });
    }
  },

  fetchMoreDeletedTags: async () => {
    const { deletedPage, deletedTags, isDeletedLoading, deletedSearchName } = get();
    if (isDeletedLoading) return;

    const nextPage = deletedPage + 1;
    set({ isDeletedLoading: true });
    try {
      const result = await tagApi.queryDeletedTags({
        page: nextPage,
        page_size: 20,
        tag_name: deletedSearchName || undefined,
      });
      set({
        deletedTags: [...deletedTags, ...result.list],
        deletedTotal: result.total,
        deletedPage: nextPage,
        isDeletedLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch more deleted tags:', error);
      set({ isDeletedLoading: false });
    }
  },

  setDeletedSearchName: (name) => set({ deletedSearchName: name }),

  searchDeletedTags: async (name) => {
    set({ deletedSearchName: name, deletedPage: 1 });
    await get().fetchDeletedTags({ page: 1, tag_name: name });
  },

  // ============ 通用 ============

  reset: () =>
    set({
      tags: [],
      total: 0,
      page: 1,
      searchName: '',
      selectedTagIds: [],
      deletedTags: [],
      deletedTotal: 0,
      deletedPage: 1,
      deletedSearchName: '',
    }),

  refreshTags: async () => {
    await get().fetchTags();
  },
}));
