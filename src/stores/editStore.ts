import { create } from 'zustand';
import type { AudioFormat } from '@/types/audio';

export interface SelectedAudio {
  audio_url: string;
  file_name: string;
  audio_duration?: number; // 原始音频时长，用于剪辑
  file_format?: AudioFormat; // 原始音频格式，用于设置默认输出格式
}

export interface EditParams {
  volume_multiplier: number;
  fade_in_ms: number;
  fade_out_ms: number;
  clip_start_time: number;
  clip_end_time: number;
}

export interface OutputAudio {
  original_url: string;
  original_file_name: string;
  audio_url: string;
  is_edited: boolean;
  edit_params: EditParams;
  audio_duration: number;
  file_size: number;
  file_format: string;
  file_name: string;
  temp_id: number | null;
  created_at: string;
  style_type?: string; // 风格类型（从后端返回）
}

interface EditStore {
  // 弹窗状态
  isOpen: boolean;

  // 输入：选中的音频
  selectedAudios: SelectedAudio[];

  // 编辑参数
  volumeMultiplier: number;
  fadeInMs: number;
  fadeOutMs: number;
  clipStartTime: number;
  clipEndTime: number;
  outputFormat: AudioFormat;

  // 输出：编辑结果
  outputAudios: OutputAudio[];

  // 请求状态
  isApplying: boolean;
  error: string | null;

  // Actions
  openDialog: (audios: SelectedAudio[]) => void;
  closeDialog: () => void;
  removeAudio: (index: number) => void;
  clearAllAudios: () => void;
  setVolume: (value: number) => void;
  setFadeIn: (value: number) => void;
  setFadeOut: (value: number) => void;
  setClipStart: (value: number) => void;
  setClipEnd: (value: number) => void;
  setFormat: (format: AudioFormat) => void;
  applyEdit: () => Promise<void>;
  clearOutput: () => void;
  reset: () => void;
}

export const useEditStore = create<EditStore>((set, get) => ({
  // 初始状态
  isOpen: false,
  selectedAudios: [],
  volumeMultiplier: 1.0,
  fadeInMs: 0,
  fadeOutMs: 0,
  clipStartTime: 0,
  clipEndTime: 0,
  outputFormat: 'MP3',
  outputAudios: [],
  isApplying: false,
  error: null,

  // 打开弹窗
  openDialog: (audios) => {
    // 获取第一个音频的时长作为默认剪辑结束时间
    const firstAudio = audios[0];
    const firstAudioDuration = firstAudio?.audio_duration || 0;
    // 使用第一个音频的格式作为默认输出格式，若未指定则默认 MP3
    const defaultFormat = firstAudio?.file_format || 'MP3';

    set({
      isOpen: true,
      selectedAudios: audios,
      volumeMultiplier: 1.0,
      fadeInMs: 0,
      fadeOutMs: 0,
      clipStartTime: 0,
      clipEndTime: firstAudioDuration,
      outputFormat: defaultFormat,
      outputAudios: [],
      isApplying: false,
      error: null,
    });
  },

  // 关闭弹窗
  closeDialog: () => {
    set({ isOpen: false });
  },

  // 移除单个音频
  removeAudio: (index) => {
    const { selectedAudios } = get();
    const newAudios = selectedAudios.filter((_, i) => i !== index);
    if (newAudios.length === 0) {
      set({ isOpen: false, selectedAudios: [] });
    } else {
      // 更新剪辑结束时间
      const firstAudioDuration = newAudios[0]?.audio_duration || 0;
      set({
        selectedAudios: newAudios,
        clipEndTime: firstAudioDuration,
      });
    }
  },

  // 清空所有音频
  clearAllAudios: () => {
    set({ isOpen: false, selectedAudios: [], outputAudios: [] });
  },

  // 设置音量
  setVolume: (value) => {
    set({ volumeMultiplier: value });
  },

  // 设置淡入
  setFadeIn: (value) => {
    set({ fadeInMs: value });
  },

  // 设置淡出
  setFadeOut: (value) => {
    set({ fadeOutMs: value });
  },

  // 设置剪辑开始时间
  setClipStart: (value) => {
    const { clipEndTime } = get();
    // 确保开始时间不超过结束时间
    if (value < clipEndTime) {
      set({ clipStartTime: value });
    }
  },

  // 设置剪辑结束时间
  setClipEnd: (value) => {
    const { clipStartTime } = get();
    // 确保结束时间大于开始时间
    if (value > clipStartTime) {
      set({ clipEndTime: value });
    }
  },

  // 设置格式
  setFormat: (format) => {
    set({ outputFormat: format });
  },

  // 应用编辑
  applyEdit: async () => {
    const { selectedAudios, volumeMultiplier, fadeInMs, fadeOutMs, clipStartTime, clipEndTime, outputFormat } = get();

    if (selectedAudios.length === 0) {
      set({ error: '请选择要编辑的音频' });
      return;
    }

    set({ isApplying: true, error: null });

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'edit_audio',
          params: {
            audio_list: selectedAudios.map((audio) => ({
              audio_url: audio.audio_url,
              file_name: audio.file_name,
              volume_multiplier: volumeMultiplier,
              fade_in_ms: fadeInMs,
              fade_out_ms: fadeOutMs,
              clip_start_time: clipStartTime,
              clip_end_time: clipEndTime,
              output_format: outputFormat,
            })),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        set({ outputAudios: data.data.edited_audios, isApplying: false });
      } else {
        set({ error: data.error || '编辑失败', isApplying: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '网络错误，请重试',
        isApplying: false,
      });
    }
  },

  // 清空输出
  clearOutput: () => {
    set({ outputAudios: [] });
  },

  // 重置状态
  reset: () => {
    set({
      isOpen: false,
      selectedAudios: [],
      volumeMultiplier: 1.0,
      fadeInMs: 0,
      fadeOutMs: 0,
      clipStartTime: 0,
      clipEndTime: 0,
      outputFormat: 'MP3',
      outputAudios: [],
      isApplying: false,
      error: null,
    });
  },
}));
