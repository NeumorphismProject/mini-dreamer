'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, Square, Repeat, ZoomIn, ZoomOut, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration } from '@/lib/editUtils';
import { cn } from '@/lib/utils';

interface AudioClipEditorProps {
  audioUrl: string;
  fileName: string;
  originalDuration: number;
  clipStart: number;
  clipEnd: number;
  onClipStartChange: (value: number) => void;
  onClipEndChange: (value: number) => void;
  onDurationLoaded?: (duration: number) => void;
}

export function AudioClipEditor({
  audioUrl,
  fileName,
  originalDuration,
  clipStart,
  clipEnd,
  onClipStartChange,
  onClipEndChange,
  onDurationLoaded,
}: AudioClipEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | 'playhead' | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%
  const [scrollOffset, setScrollOffset] = useState(0); // 滚动偏移（秒）
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioDuration, setAudioDuration] = useState(originalDuration); // 音频实际时长

  // 使用 ref 存储最新的回调函数和状态值，避免 useEffect 不必要的重新执行
  const onClipEndChangeRef = useRef(onClipEndChange);
  const onDurationLoadedRef = useRef(onDurationLoaded);
  const clipStartRef = useRef(clipStart);
  const clipEndRef = useRef(clipEnd);
  const isLoopingRef = useRef(isLooping);
  const isPlayingRef = useRef(isPlaying);
  const zoomLevelRef = useRef(zoomLevel);
  const scrollOffsetRef = useRef(scrollOffset);
  const audioDurationRef = useRef(audioDuration);

  // 保持 ref 同步
  useEffect(() => {
    onClipEndChangeRef.current = onClipEndChange;
    onDurationLoadedRef.current = onDurationLoaded;
    clipStartRef.current = clipStart;
    clipEndRef.current = clipEnd;
    isLoopingRef.current = isLooping;
    isPlayingRef.current = isPlaying;
    zoomLevelRef.current = zoomLevel;
    scrollOffsetRef.current = scrollOffset;
    audioDurationRef.current = audioDuration;
  });

  // 派生值
  const actualDuration = audioDuration;
  const visibleDuration = actualDuration / zoomLevel;
  const visibleStart = scrollOffset;
  const visibleEnd = Math.min(scrollOffset + visibleDuration, actualDuration);

  // 初始化音频 - 仅依赖 audioUrl
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audioRef.current = audio;
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setScrollOffset(0);
    setZoomLevel(1);

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      const duration = audio.duration;
      setAudioDuration(duration);
      onClipEndChangeRef.current?.(duration);
      onDurationLoadedRef.current?.(duration);
    };

    const handleEnded = () => {
      if (isLoopingRef.current) {
        audio.currentTime = clipStartRef.current;
        audio.play();
      } else {
        setIsPlaying(false);
        setCurrentTime(clipStartRef.current);
      }
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // 自动滚动：当播放头接近可见区域右边界时
      if (isPlayingRef.current && zoomLevelRef.current > 1) {
        const currentVisibleDuration = audioDurationRef.current / zoomLevelRef.current;
        const rightBoundary = scrollOffsetRef.current + currentVisibleDuration * 0.8;
        if (time > rightBoundary && time < audioDurationRef.current - 0.5) {
          setScrollOffset(Math.min(time - currentVisibleDuration * 0.2, audioDurationRef.current - currentVisibleDuration));
        }
      }

      // 剪辑范围播放结束
      if (time >= clipEndRef.current && isPlayingRef.current) {
        if (isLoopingRef.current) {
          audio.currentTime = clipStartRef.current;
        } else {
          audio.pause();
          setIsPlaying(false);
          audio.currentTime = clipStartRef.current;
          setCurrentTime(clipStartRef.current);
        }
      }
    };

    const handleError = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

        // 提取波形数据（更高精度）
        const rawData = audioBuffer.getChannelData(0);
        const samples = 1000; // 提高精度
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(sum / blockSize);
        }

        const maxVal = Math.max(...filteredData);
        const normalizedData = filteredData.map((v) => v / maxVal);
        setWaveformData(normalizedData);
      } catch (error) {
        console.error('Failed to load waveform:', error);
        const fakeData = Array.from({ length: 1000 }, () => Math.random() * 0.5 + 0.25);
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
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 计算可见区域的波形数据范围
    const startSample = Math.floor((visibleStart / actualDuration) * waveformData.length);
    const endSample = Math.ceil((visibleEnd / actualDuration) * waveformData.length);
    const visibleSamples = endSample - startSample;

    const barWidth = width / visibleSamples;

    // 绘制网格线
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 绘制剪辑区域外的遮罩
    const clipStartX = ((clipStart - visibleStart) / visibleDuration) * width;
    const clipEndX = ((clipEnd - visibleStart) / visibleDuration) * width;

    // 绘制波形
    waveformData.slice(startSample, endSample).forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.85);

      // 判断是否在剪辑区域内
      const isInRegion = (index / visibleSamples) * visibleDuration + visibleStart >= clipStart && 
                         (index / visibleSamples) * visibleDuration + visibleStart <= clipEnd;

      // 波形颜色
      const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
      if (isInRegion) {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(156, 163, 175, 0.4)');
        gradient.addColorStop(0.5, 'rgba(156, 163, 175, 0.6)');
        gradient.addColorStop(1, 'rgba(156, 163, 175, 0.4)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 0.5, 1), barHeight);
    });

    // 绘制剪辑区域外的暗色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    if (clipStart > visibleStart) {
      ctx.fillRect(0, 0, Math.max(clipStartX, 0), height);
    }
    if (clipEnd < visibleEnd) {
      ctx.fillRect(Math.min(clipEndX, width), 0, width - Math.min(clipEndX, width), height);
    }

    // 绘制剪辑边界线
    if (clipStartX >= 0 && clipStartX <= width) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clipStartX, 0);
      ctx.lineTo(clipStartX, height);
      ctx.stroke();

      // 边界手柄
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(clipStartX - 6, 0);
      ctx.lineTo(clipStartX + 6, 0);
      ctx.lineTo(clipStartX, 10);
      ctx.closePath();
      ctx.fill();
    }

    if (clipEndX >= 0 && clipEndX <= width) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clipEndX, 0);
      ctx.lineTo(clipEndX, height);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(clipEndX - 6, height);
      ctx.lineTo(clipEndX + 6, height);
      ctx.lineTo(clipEndX, height - 10);
      ctx.closePath();
      ctx.fill();
    }

    // 绘制播放头
    const playheadX = ((currentTime - visibleStart) / visibleDuration) * width;
    if (playheadX >= 0 && playheadX <= width) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // 播放头三角形
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 10);
      ctx.closePath();
      ctx.fill();
    }
  }, [waveformData, clipStart, clipEnd, currentTime, visibleStart, visibleEnd, visibleDuration, actualDuration]);

  // 重绘波形
  useEffect(() => {
    drawWaveform();
    const handleResize = () => drawWaveform();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  // 播放控制
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // 从剪辑起点开始播放
      if (currentTime < clipStart || currentTime >= clipEnd) {
        audio.currentTime = clipStart;
        setCurrentTime(clipStart);
      }
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime, clipStart, clipEnd]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    audio.currentTime = clipStart;
    setCurrentTime(clipStart);
  }, [clipStart]);

  const skipToStart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = clipStart;
    setCurrentTime(clipStart);
  }, [clipStart]);

  const skipToEnd = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(clipEnd - 0.1, clipStart);
    setCurrentTime(audio.currentTime);
  }, [clipEnd, clipStart]);

  // 缩放控制
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.5, 20);
      // 保持播放头在可见区域中心
      if (currentTime > 0) {
        const newVisibleDuration = actualDuration / newZoom;
        setScrollOffset(Math.max(0, Math.min(currentTime - newVisibleDuration / 2, actualDuration - newVisibleDuration)));
      }
      return newZoom;
    });
  }, [currentTime, actualDuration]);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev / 1.5, 1);
      if (newZoom === 1) {
        setScrollOffset(0);
      }
      return newZoom;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setScrollOffset(0);
  }, []);

  // 鼠标事件处理
  const getTimeFromX = useCallback((clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * visibleDuration + visibleStart;
  }, [visibleDuration, visibleStart]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (draggingHandle) return;
    const time = getTimeFromX(e.clientX);
    
    // 跳转播放位置
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, actualDuration));
      setCurrentTime(Math.max(0, Math.min(time, actualDuration)));
    }
  }, [draggingHandle, getTimeFromX, actualDuration]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const time = getTimeFromX(e.clientX);
    const rect = canvasRef.current?.getBoundingClientRect();
    const clickX = e.clientX - (rect?.left || 0);
    const width = rect?.width || 0;

    const clipStartX = ((clipStart - visibleStart) / visibleDuration) * width;
    const clipEndX = ((clipEnd - visibleStart) / visibleDuration) * width;
    const playheadX = ((currentTime - visibleStart) / visibleDuration) * width;

    // 判断点击位置
    if (Math.abs(clickX - clipStartX) < 12) {
      setDraggingHandle('start');
    } else if (Math.abs(clickX - clipEndX) < 12) {
      setDraggingHandle('end');
    } else if (Math.abs(clickX - playheadX) < 12) {
      setDraggingHandle('playhead');
    }
  }, [getTimeFromX, clipStart, clipEnd, currentTime, visibleStart, visibleDuration]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingHandle) return;
    const time = getTimeFromX(e.clientX);

    if (draggingHandle === 'start') {
      onClipStartChange(Math.max(0, Math.min(time, clipEnd - 0.1)));
    } else if (draggingHandle === 'end') {
      onClipEndChange(Math.min(actualDuration, Math.max(time, clipStart + 0.1)));
    } else if (draggingHandle === 'playhead') {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, Math.min(time, actualDuration));
        setCurrentTime(Math.max(0, Math.min(time, actualDuration)));
      }
    }
  }, [draggingHandle, getTimeFromX, clipEnd, clipStart, actualDuration, onClipStartChange, onClipEndChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingHandle(null);
  }, []);

  return (
    <div className="flex flex-col rounded-lg border bg-card overflow-hidden shadow-sm">
      {/* 播放控制栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          {/* 播放控制按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={skipToStart}
            disabled={isLoading}
            title="跳到起点"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={togglePlay}
            disabled={isLoading}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={stopPlayback}
            disabled={isLoading}
            title="停止"
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={skipToEnd}
            disabled={isLoading}
            title="跳到终点"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant={isLooping ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsLooping(!isLooping)}
            disabled={isLoading}
            title={isLooping ? '关闭循环' : '开启循环'}
          >
            <Repeat className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* 音量控制 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? '取消静音' : '静音'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(val) => {
                setVolume(val[0] / 100);
                if (val[0] > 0) setIsMuted(false);
              }}
              max={100}
              step={1}
              className="h-4"
            />
          </div>
        </div>

        {/* 时间显示 */}
        <div className="flex items-center gap-2 text-sm tabular-nums">
          <span className="text-primary font-medium">{formatDuration(currentTime)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatDuration(actualDuration)}</span>
          <span className="text-xs text-primary/70 ml-2">
            选中: {formatDuration(clipEnd - clipStart)}
          </span>
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center justify-end px-3 py-1.5 border-b bg-muted/20 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          disabled={zoomLevel <= 1}
          className="h-7 px-2"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          disabled={zoomLevel >= 20}
          className="h-7 px-2"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        {zoomLevel > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="h-7 px-2 text-xs"
          >
            重置
          </Button>
        )}
      </div>

      {/* 波形显示区域 */}
      <div
        className="relative h-32 cursor-crosshair bg-muted/10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            加载中...
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        )}

        {/* 文件名标签 */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground truncate max-w-[200px]">
          {fileName}
        </div>
      </div>

      {/* 拖拽提示 */}
      <div className="flex items-center justify-center py-1.5 border-t bg-muted/20 text-xs text-muted-foreground">
        拖动红色边界线调整剪辑范围 | 点击波形跳转播放位置 | 使用缩放按钮查看细节
      </div>
    </div>
  );
}
