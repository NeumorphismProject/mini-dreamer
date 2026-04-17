// ============ 音频类型枚举 ============
export type AudioType = 'sound_effect';

// ============ 风格类型 ============
export const SOUND_EFFECT_STYLES = [
  '清脆', '浑厚', '尖锐', '柔和', '空灵',
  '沉重', '急促', '悠扬', '机械', '自然',
] as const;

export type SoundEffectStyle = typeof SOUND_EFFECT_STYLES[number];

// ============ 音频格式 ============
export const AUDIO_FORMATS: { value: AudioFormat; label: string; description: string }[] = [
  { value: 'MP3', label: 'MP3', description: '最通用，兼容性最好' },
  { value: 'WAV', label: 'WAV', description: '无损音质，文件较大' },
  { value: 'AAC', label: 'AAC', description: '高效压缩，音质好' },
  { value: 'FLAC', label: 'FLAC', description: '无损压缩，音质最佳' },
  { value: 'OGG', label: 'OGG', description: '开源格式，效果独特' },
];
export type AudioFormat = 'MP3' | 'WAV' | 'AAC' | 'FLAC' | 'OGG';

// ============ 音频项 ============
export interface AudioItem {
  id?: number;
  temp_id?: number;
  audio_name?: string;
  file_name: string;
  file_format: AudioFormat;
  audio_url: string;
  audio_duration: number;
  file_size: number;
  style_type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  // 标签关联（来自 API 响应）
  tags?: TagItem[];
  // 源图片URL（来自 API 响应，可能不存在或为空）
  source_image_url?: string | null;
}

// 标签项（与 audio.ts 共享）
export interface TagItem {
  id: number;
  tag_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted?: boolean;
}

// ============ 列表查询参数 ============
export interface QueryParams {
  page?: number;
  page_size?: number;
  file_name?: string;
  file_format?: AudioFormat;
  audio_duration_min?: number;
  audio_duration_max?: number;
  file_size_min?: number;
  file_size_max?: number;
  style_type?: string;
  description?: string;
  update_time_min?: string;
}

// ============ 列表响应 ============
export interface ListResponse<T> {
  total: number;
  page: number;
  page_size: number;
  list: T[];
}

// ============ 生成参数 ============
export interface GenerateParams {
  audio_type: AudioType;
  style_type: string;
  description: string;
  file_format: AudioFormat;
  duration: number;
}

// ============ 保存参数 ============
export interface SaveParams {
  temp_id: number;
  audio_name: string;
  audio_type: AudioType;
  description: string;
  tag_ids?: string; // 标签ID（逗号分隔），如："1,2,3"
}

// ============ 错误信息 ============
export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
}

// ============ 生成响应 ============
export interface GenerateResponse {
  temp_id: number;
  audio_url: string;
  audio_duration: number;
  file_size: number;
  file_format: AudioFormat;
  style_type: string;
  description: string;
  file_name: string;
  created_at: string;
}

// ============ 保存响应 ============
export type SaveResponse = AudioItem;

// ============ 风格配置 ============
export interface StyleConfig {
  label: string;
  value: string;
  description: string;
  emoji: string;
}

export const SOUND_EFFECT_STYLE_CONFIGS: StyleConfig[] = [
  { label: '清脆', value: '清脆', description: '铃声、点击声、玻璃破碎', emoji: '🔔' },
  { label: '浑厚', value: '浑厚', description: '炮声、雷声、低频音效', emoji: '🎺' },
  { label: '尖锐', value: '尖锐', description: '报警声、金属碰撞', emoji: '⚡' },
  { label: '柔和', value: '柔和', description: '风声、水流声', emoji: '🌊' },
  { label: '空灵', value: '空灵', description: '魔法效果、幻想场景', emoji: '✨' },
  { label: '沉重', value: '沉重', description: '门声、重物落地', emoji: '🪨' },
  { label: '急促', value: '急促', description: '警报、心跳声', emoji: '💓' },
  { label: '悠扬', value: '悠扬', description: '鸟鸣、乐器声', emoji: '🎵' },
  { label: '机械', value: '机械', description: '机器声、科技音效', emoji: '⚙️' },
  { label: '自然', value: '自然', description: '自然环境音', emoji: '🌳' },
  { label: '电子', value: '电子', description: '电子合成音、数字信号', emoji: '📡' },
  { label: '古典', value: '古典', description: '古典乐器、宫廷音效', emoji: '🎻' },
  { label: '卡通', value: '卡通', description: '动漫效果音、夸张音效', emoji: '🎬' },
  { label: '恐怖', value: '恐怖', description: '惊悚、幽灵、阴森氛围', emoji: '👻' },
  { label: '运动', value: '运动', description: '运动场景、比赛欢呼', emoji: '🏆' },
  { label: '战斗', value: '战斗', description: '打斗、武器交锋、爆炸', emoji: '💥' },
  { label: '科幻', value: '科幻', description: '太空、飞船、未来科技', emoji: '🚀' },
  { label: '民俗', value: '民俗', description: '民族风、地方特色音效', emoji: '🏮' },
];

// ============ 时长范围 ============
export const DURATION_RANGES = {
  sound_effect: { min: 1, max: 10, default: 4 },
} as const;
