import { create } from 'zustand';
import type { AudioItem } from '@/types';

interface SaveModalState {
  isOpen: boolean;
  audio: AudioItem | null;
  onSuccess?: () => void;
}

interface UIState {
  // 保存弹窗
  saveModal: SaveModalState;
  
  // 删除确认弹窗
  deleteModal: {
    isOpen: boolean;
    audio: AudioItem | null;
    onSuccess?: () => void;
  };

  // Actions
  openSaveModal: (audio: AudioItem, onSuccess?: () => void) => void;
  closeSaveModal: () => void;
  openDeleteModal: (audio: AudioItem, onSuccess?: () => void) => void;
  closeDeleteModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  saveModal: {
    isOpen: false,
    audio: null,
  },

  deleteModal: {
    isOpen: false,
    audio: null,
  },

  openSaveModal: (audio, onSuccess) =>
    set({
      saveModal: { isOpen: true, audio, onSuccess },
    }),

  closeSaveModal: () =>
    set({
      saveModal: { isOpen: false, audio: null, onSuccess: undefined },
    }),

  openDeleteModal: (audio, onSuccess) =>
    set({
      deleteModal: { isOpen: true, audio, onSuccess },
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: { isOpen: false, audio: null, onSuccess: undefined },
    }),
}));
