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
