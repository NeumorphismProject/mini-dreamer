'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatDuration } from '@/lib/editUtils';

interface AudioWaveformPlayerProps {
  audioUrl: string;
  fileName: string;
  duration?: number;
  clipStart?: number;
  clipEnd?: number;
  onDurationLoaded?: (duration: number) => void;
  showClipRegion?: boolean;
  /** 是否显示循环播放开关 */
  showLoopToggle?: boolean;
}

export function AudioWaveformPlayer({
  audioUrl,
  fileName,
  duration: initialDuration,
  clipStart = 0,
  clipEnd,
  onDurationLoaded,
  showClipRegion = false,
  showLoopToggle = false,
}: AudioWaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLooping, setIsLooping] = useState(false);

  // 初始化音频
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      setDuration(dur);
      onDurationLoaded?.(dur);
      setIsLoading(false);
    });

    audio.addEventListener('ended', () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, onDurationLoaded, isLooping]);

  // 解析音频波形数据
  useEffect(() => {
    const loadWaveform = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;

        // 提取波形数据（降低采样率以提高性能）
        const rawData = audioBuffer.getChannelData(0);
        const samples = 200; // 波形采样点数
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(sum / blockSize);
        }

        // 归一化
        const maxVal = Math.max(...filteredData);
        const normalizedData = filteredData.map((v) => v / maxVal);
        setWaveformData(normalizedData);
      } catch (error) {
        console.error('Failed to load waveform:', error);
        // 如果解析失败，生成假数据用于显示
        const fakeData = Array.from({ length: 200 }, () => Math.random() * 0.5 + 0.25);
        setWaveformData(fakeData);
      }
    };

    if (audioUrl) {
      loadWaveform();
    }
  }, [audioUrl]);

  // 绘制波形
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 获取主题颜色
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#2563eb';
    const mutedColor = computedStyle.getPropertyValue('--muted').trim() || '#f4f4f5';
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim() || '#09090b';
    const borderColor = computedStyle.getPropertyValue('--border').trim() || '#e4e4e7';

    // 绘制剪辑区域背景（如果启用）
    if (showClipRegion && clipEnd && duration > 0) {
      const startX = (clipStart / duration) * width;
      const endX = (clipEnd / duration) * width;
      
      // 未选中区域变暗
      ctx.fillStyle = `${mutedColor}`;
      ctx.fillRect(0, 0, startX, height);
      ctx.fillRect(endX, 0, width - endX, height);
    }

    // 绘制波形
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.8);

      // 判断是否在剪辑区域内
      const isInClipRegion = !showClipRegion || (duration > 0 && clipEnd !== undefined &&
        (index / waveformData.length) * duration >= clipStart && 
        (index / waveformData.length) * duration <= clipEnd);

      ctx.fillStyle = isInClipRegion ? primaryColor : mutedColor;
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // 绘制播放进度（使用醒目的蓝色）
    if (duration > 0) {
      const progressX = (currentTime / duration) * width;
      ctx.strokeStyle = '#0ea5e9'; // sky-500，醒目的蓝色
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();

      // 播放头圆点
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(progressX, 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制剪辑边界线（如果启用）
    if (showClipRegion && clipEnd && duration > 0) {
      const startX = (clipStart / duration) * width;
      const endX = (clipEnd / duration) * width;

      ctx.strokeStyle = '#ef4444'; // 红色
      ctx.lineWidth = 2;
      
      // 开始边界
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.stroke();

      // 结束边界
      ctx.beginPath();
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();

      // 边界手柄
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(startX, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [waveformData, currentTime, duration, clipStart, clipEnd, showClipRegion]);

  // 更新波形绘制
  useEffect(() => {
    drawWaveform();

    const handleResize = () => drawWaveform();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  // 动画帧更新进度
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && isPlaying) {
        drawWaveform();
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  // 播放/暂停
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 点击波形跳转
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    drawWaveform();
  };

  return (
    <div className="space-y-3">
      {/* 文件信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <span>{formatDuration(currentTime)}</span>
          <span>/</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* 波形播放器 */}
      <div className="relative">
        {/* 播放控制 */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </div>

        {/* 波形 */}
        <canvas
          ref={canvasRef}
          className="w-full h-20 cursor-pointer rounded-md bg-muted/30"
          onClick={handleWaveformClick}
        />
      </div>

      {/* 循环播放开关 */}
      {showLoopToggle && (
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <Switch
            checked={isLooping}
            onCheckedChange={setIsLooping}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Repeat className="h-3 w-3" />
            循环播放
          </span>
        </label>
      )}

      {/* 剪辑信息（如果启用） */}
      {showClipRegion && clipEnd && duration > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>剪辑起点: {clipStart.toFixed(2)}s</span>
          <span>剪辑终点: {clipEnd.toFixed(2)}s</span>
          <span>剪辑时长: {(clipEnd - clipStart).toFixed(2)}s</span>
        </div>
      )}
    </div>
  );
}
