import { create } from 'zustand';
import type { AudioItem } from '@/types';

interface PlayerState {
  // 状态
  currentAudio: AudioItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playlist: AudioItem[];

  // Actions
  setCurrentAudio: (audio: AudioItem | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaylist: (list: AudioItem[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // 初始状态
  currentAudio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playlist: [],

  // Actions
  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlaylist: (list) => set({ playlist: list }),

  playNext: () => {
    const { playlist, currentAudio } = get();
    if (!currentAudio || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (item) => item.id === currentAudio.id || item.temp_id === currentAudio.temp_id
    );
    if (currentIndex < playlist.length - 1) {
      set({ currentAudio: playlist[currentIndex + 1] });
    }
  },

  playPrevious: () => {
    const { playlist, currentAudio } = get();
    if (!currentAudio || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(
      (item) => item.id === currentAudio.id || item.temp_id === currentAudio.temp_id
    );
    if (currentIndex > 0) {
      set({ currentAudio: playlist[currentIndex - 1] });
    }
  },

  reset: () =>
    set({
      currentAudio: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }),
}));
