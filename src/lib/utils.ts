import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============ 格式化函数 ============

/**
 * 格式化时长（秒 → mm:ss）
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * 格式化时长为中文
 */
export function formatDurationChinese(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}秒`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}分${secs}秒`;
}

// ============ 音频工具函数 ============

/**
 * 创建音频对象
 */
export function createAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = url;
  return audio;
}

/**
 * 预加载音频
 */
export function preloadAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', () => resolve(), { once: true });
    audio.addEventListener('error', reject, { once: true });
    audio.src = url;
    audio.load();
  });
}

/**
 * 获取音频时长
 */
export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', reject, { once: true });
    audio.src = url;
    audio.load();
  });
}

// ============ 音频类型 ============

export type AudioCategory = 'sound_effect' | 'background_music';

export const AUDIO_CATEGORY_CONFIG = {
  sound_effect: {
    label: '音效',
    labelEn: 'SE',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  background_music: {
    label: '背景音乐',
    labelEn: 'BGM',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
} as const;

/**
 * 根据文件名识别音频类型
 * 规则：se_ 开头为音效，bg_ 开头为背景音乐
 */
export function getAudioCategory(fileName: string): AudioCategory {
  if (!fileName) return 'sound_effect';
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.startsWith('se_')) return 'sound_effect';
  if (lowerFileName.startsWith('bg_')) return 'background_music';
  return 'sound_effect'; // 默认值
}

/**
 * 获取音频类型标签（中文）
 */
export function getAudioCategoryLabel(fileName: string): string {
  const category = getAudioCategory(fileName);
  return AUDIO_CATEGORY_CONFIG[category].label;
}

/**
 * 获取音频类型标签样式
 */
export function getAudioCategoryStyle(fileName: string): string {
  const category = getAudioCategory(fileName);
  return AUDIO_CATEGORY_CONFIG[category].color;
}

/**
 * 获取音频类型配置
 */
export function getAudioCategoryConfig(fileName: string) {
  const category = getAudioCategory(fileName);
  return AUDIO_CATEGORY_CONFIG[category];
}

// ============ 下载函数 ============

/**
 * 下载音频文件
 */
export async function downloadAudio(
  url: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
