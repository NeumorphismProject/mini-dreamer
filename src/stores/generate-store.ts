import { create } from 'zustand';
import type { AudioType, AudioItem, GenerateResponse, ErrorInfo } from '@/types';

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

interface GenerateState {
  // 表单状态
  audioType: AudioType;
  styleType: string;
  description: string;
  fileFormat: string;
  duration: number;

  // 生成状态
  status: GenerationStatus;
  result: GenerateResponse | null;
  error: ErrorInfo | null;

  // 编辑模式
  editAudio: AudioItem | null;

  // Actions
  setAudioType: (type: AudioType) => void;
  setStyleType: (style: string) => void;
  setDescription: (desc: string) => void;
  setFileFormat: (format: string) => void;
  setDuration: (duration: number) => void;
  setStatus: (status: GenerationStatus) => void;
  setResult: (result: GenerateResponse | null) => void;
  setError: (error: ErrorInfo | null) => void;
  setEditAudio: (audio: AudioItem | null) => void;
  reset: () => void;
}

const initialState = {
  audioType: 'sound_effect' as AudioType,
  styleType: '',
  description: '',
  fileFormat: 'MP3',
  duration: 4,
  status: 'idle' as GenerationStatus,
  result: null,
  error: null,
  editAudio: null,
};

export const useGenerateStore = create<GenerateState>((set) => ({
  ...initialState,

  setAudioType: (type) => set({ audioType: type }),
  setStyleType: (style) => set({ styleType: style }),
  setDescription: (desc) => set({ description: desc }),
  setFileFormat: (format) => set({ fileFormat: format }),
  setDuration: (duration) => set({ duration }),
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: result ? 'success' : 'idle' }),
  setError: (error) => set({ error, status: 'error' }),
  setEditAudio: (audio) => set({ 
    editAudio: audio,
    // 如果有编辑数据，同时更新表单字段
    ...(audio && {
      styleType: audio.style_type || '',
      description: audio.description || '',
      fileFormat: audio.file_format || 'MP3',
      duration: audio.audio_duration || 1,
    })
  }),
  reset: () => set(initialState),
}));
