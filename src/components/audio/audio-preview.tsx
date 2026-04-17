'use client';

import { useState, useRef, useEffect } from 'react';
import type { AudioItem, GenerateResponse } from '@/types';
import { usePlayerStore } from '@/stores';
import { formatDuration, formatFileSize } from '@/lib/utils';
import { downloadAudio } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Pencil, X, ZoomIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AudioPreviewProps {
  audio: AudioItem | GenerateResponse;
  compact?: boolean;
  showEdit?: boolean;
}

// 类型守卫：判断是否为 AudioItem
function isAudioItem(audio: AudioItem | GenerateResponse): audio is AudioItem {
  return 'id' in audio || 'temp_id' in audio;
}

export function AudioPreview({ audio, compact = false, showEdit = false }: AudioPreviewProps) {
  const { currentAudio, isPlaying, setCurrentAudio, setIsPlaying } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 判断是否有图片或视频
  const audioWithMedia = audio as AudioItem & { image_url?: string; video_url?: string };
  const hasImage = 'image_url' in audio && audioWithMedia.image_url;
  const hasVideo = 'video_url' in audio && audioWithMedia.video_url;
  const imageUrl = hasImage ? audioWithMedia.image_url : null;
  const videoUrl = hasVideo ? audioWithMedia.video_url : null;

  const isCurrentAudio = currentAudio?.audio_url === audio.audio_url;
  const isCurrentlyPlaying = isCurrentAudio && isPlaying;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';

      const audioEl = audioRef.current;

      audioEl.addEventListener('timeupdate', () => {
        setCurrentTime(audioEl.currentTime);
      });

      audioEl.addEventListener('loadedmetadata', () => {
        setDuration(audioEl.duration);
      });

      audioEl.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      return () => {
        audioEl.pause();
        audioEl.src = '';
      };
    }
  }, [setIsPlaying]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (audioEl.src !== audio.audio_url) {
      audioEl.src = audio.audio_url;
      audioEl.load();
    }

    if (isCurrentlyPlaying) {
      audioEl.play().catch(console.error);
    } else {
      audioEl.pause();
    }
  }, [audio, isCurrentlyPlaying]);

  const handlePlay = () => {
    if (isCurrentAudio) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audio as AudioItem);
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadAudio(audio.audio_url, audio.file_name);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 图片点击预览
  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // 获取编辑链接的 ID
  const getEditId = () => {
    if (isAudioItem(audio)) {
      return audio.temp_id || audio.id;
    }
    return 'temp_id' in audio ? audio.temp_id : null;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0"
          onClick={handlePlay}
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">
            {isAudioItem(audio) && audio.audio_name ? audio.audio_name : audio.file_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDuration(audio.audio_duration)} · {audio.file_format}
          </p>
        </div>
        <div className="flex gap-1">
          {showEdit && getEditId() && (
            <Link href={`/generate?edit=${getEditId()}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Audio info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {isAudioItem(audio) && audio.audio_name ? audio.audio_name : audio.file_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDuration(audio.audio_duration)} · {audio.file_format} · {formatFileSize(audio.file_size)}
            </p>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
            {audio.file_format}
          </Badge>
        </div>

        {/* Media Grid - 图片和视频展示 */}
        {(hasImage || hasVideo) && (
          <div className={`grid ${hasImage && hasVideo ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {/* 图片展示 */}
            {imageUrl && (
              <div 
                className="relative aspect-video rounded-lg overflow-hidden bg-muted/30 cursor-pointer group"
                onClick={() => handleImageClick(imageUrl)}
              >
                <img 
                  src={imageUrl} 
                  alt="音频封面" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            
            {/* 视频展示 */}
            {videoUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/30">
                <video 
                  src={videoUrl} 
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              </div>
            )}
          </div>
        )}

        {/* Progress bar with play controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handlePlay} className="shrink-0">
              {isCurrentlyPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration || audio.audio_duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {audio.description && (
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            {audio.description}
          </p>
        )}

        {/* Tags */}
        {isAudioItem(audio) && audio.tags && audio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {audio.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.tag_name}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showEdit && getEditId() && (
            <Link href={`/generate?edit=${getEditId()}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                编辑
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            下载
          </Button>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={closeImagePreview}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={previewImage} 
              alt="预览图片" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
