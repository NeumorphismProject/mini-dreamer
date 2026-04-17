'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  X,
} from 'lucide-react';
import { downloadAudio } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function AudioPlayerBar() {
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    setCurrentAudio,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    reset,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);

  // 创建音频对象
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';

      const audio = audioRef.current;

      audio.addEventListener('timeupdate', () => {
        if (!isDragging) {
          setCurrentTime(audio.currentTime);
          setLocalCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        playNext();
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [isDragging, setCurrentTime, setDuration, setIsPlaying, playNext]);

  // 播放/暂停音频
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    if (audio.src !== currentAudio.audio_url) {
      audio.src = currentAudio.audio_url;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [currentAudio, isPlaying]);

  // 音量控制
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 进度拖动
  const handleSeek = (value: number[]) => {
    const time = value[0];
    setLocalCurrentTime(time);
  };

  const handleSeekCommit = (value: number[]) => {
    const time = value[0];
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
    setIsDragging(false);
  };

  // 下载音频
  const handleDownload = async () => {
    if (!currentAudio) return;
    try {
      await downloadAudio(currentAudio.audio_url, currentAudio.file_name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // 关闭播放器
  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    reset();
  };

  if (!currentAudio) return null;

  const displayTime = isDragging ? localCurrentTime : currentTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Progress bar */}
      <div className="h-1 bg-muted cursor-pointer group" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * duration;
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = time;
          setCurrentTime(time);
        }
      }}>
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${duration ? (displayTime / duration) * 100 : 0}%` }}
        />
      </div>

      <div className="container px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Audio Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {currentAudio.audio_name || currentAudio.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAudio.style_type} · {currentAudio.file_format}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={playPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={playNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground w-32">
            <span>{formatDuration(displayTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="w-20"
            />
          </div>

          {/* Download */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
