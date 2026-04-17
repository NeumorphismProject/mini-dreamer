import { create } from 'zustand';

interface ListState {
  // 筛选状态
  filters: Record<string, unknown>;
  
  // 分页状态
  page: number;
  pageSize: number;
  
  // 数据状态
  total: number;

  // Actions
  setFilters: (filters: Record<string, unknown>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
}

const initialFilters: Record<string, unknown> = {
  page: 1,
  page_size: 20,
};

export const useListStore = create<ListState>((set) => ({
  filters: initialFilters,
  page: 1,
  pageSize: 20,
  total: 0,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // 重置筛选时回到第一页
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
      page: 1,
      total: 0,
    }),

  setPage: (page) =>
    set((state) => ({
      page,
      filters: { ...state.filters, page },
    })),

  setPageSize: (pageSize) =>
    set((state) => ({
      pageSize,
      page: 1,
      filters: { ...state.filters, page_size: pageSize, page: 1 },
    })),

  setTotal: (total) => set({ total }),
}));
