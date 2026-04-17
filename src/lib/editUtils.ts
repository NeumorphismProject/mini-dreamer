import { EditParams } from '@/stores/editStore';

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * 格式化时长
 * @param seconds 秒数
 * @returns 格式化后的字符串
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * 格式化编辑参数显示
 * @param params 编辑参数
 * @returns 格式化的参数字符串
 */
export function formatEditParams(params: EditParams): string {
  const parts: string[] = [];

  if (params.volume_multiplier !== 1.0) {
    parts.push(`音量 ${params.volume_multiplier}x`);
  }

  if (params.fade_in_ms > 0) {
    parts.push(`淡入 ${params.fade_in_ms}ms`);
  }

  if (params.fade_out_ms > 0) {
    parts.push(`淡出 ${params.fade_out_ms}ms`);
  }

  // 剪辑参数
  if (params.clip_start_time !== 0 || params.clip_end_time !== undefined) {
    const endTime = params.clip_end_time || 0;
    if (params.clip_start_time > 0 || endTime > 0) {
      parts.push(`剪辑 ${params.clip_start_time}s - ${endTime}s`);
    }
  }

  return parts.length > 0 ? parts.join(' | ') : '默认参数';
}

/**
 * 验证音量参数
 * @param value 音量值
 * @returns 是否有效
 */
export function isValidVolume(value: number): boolean {
  return value >= 0 && value <= 5.0;
}

/**
 * 验证淡入淡出参数
 * @param fadeInMs 淡入时长
 * @param fadeOutMs 淡出时长
 * @param audioDurationMs 音频时长（毫秒）
 * @returns 验证结果
 */
export function validateFadeParams(
  fadeInMs: number,
  fadeOutMs: number,
  audioDurationMs: number
): { valid: boolean; error?: string } {
  if (fadeInMs < 0) {
    return { valid: false, error: '淡入时长不能为负数' };
  }

  if (fadeOutMs < 0) {
    return { valid: false, error: '淡出时长不能为负数' };
  }

  if (fadeInMs > audioDurationMs) {
    return { valid: false, error: `淡入时长不能超过音频时长 (${audioDurationMs}ms)` };
  }

  if (fadeOutMs > audioDurationMs) {
    return { valid: false, error: `淡出时长不能超过音频时长 (${audioDurationMs}ms)` };
  }

  if (fadeInMs + fadeOutMs > audioDurationMs) {
    return {
      valid: false,
      error: `淡入淡出总时长不能超过音频时长`,
    };
  }

  return { valid: true };
}

/**
 * 验证剪辑参数
 * @param startTime 开始时间（秒）
 * @param endTime 结束时间（秒）
 * @param audioDuration 音频总时长（秒）
 * @returns 验证结果
 */
export function validateClipParams(
  startTime: number,
  endTime: number,
  audioDuration: number
): { valid: boolean; error?: string } {
  if (startTime < 0) {
    return { valid: false, error: '开始时间不能为负数' };
  }

  if (endTime <= 0) {
    return { valid: false, error: '结束时间必须大于0' };
  }

  if (startTime >= audioDuration) {
    return { valid: false, error: `开始时间不能超过音频时长 (${audioDuration}s)` };
  }

  if (endTime > audioDuration) {
    return { valid: false, error: `结束时间不能超过音频时长 (${audioDuration}s)` };
  }

  if (startTime >= endTime) {
    return { valid: false, error: '开始时间必须小于结束时间' };
  }

  return { valid: true };
}

/**
 * 检查是否需要实际进行剪辑
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param originalDuration 原始音频时长
 * @returns 是否需要剪辑
 */
export function needsClipping(
  startTime: number,
  endTime: number,
  originalDuration: number
): boolean {
  // 如果开始时间是0且结束时间是原始时长，则不需要剪辑
  return startTime > 0 || endTime < originalDuration;
}

/**
 * 下载音频文件
 * @param url 音频URL
 * @param filename 下载后的文件名
 */
export async function downloadAudio(url: string, filename: string): Promise<void> {
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
    console.error('下载失败:', error);
    throw new Error('下载失败，请重试');
  }
}

/**
 * 获取文件名（不带路径）
 * @param urlOrPath URL或路径
 * @returns 文件名
 */
export function getFileName(urlOrPath: string): string {
  try {
    const url = new URL(urlOrPath);
    return url.pathname.split('/').pop() || urlOrPath;
  } catch {
    return urlOrPath.split('/').pop() || urlOrPath;
  }
}

/**
 * 判断是否有未保存的编辑结果
 * @param hasOutput 是否有输出结果
 * @returns 是否有未保存的编辑
 */
export function hasUnsavedEdits(hasOutput: boolean): boolean {
  return hasOutput;
}
