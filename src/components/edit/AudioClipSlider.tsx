'use client';

import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { formatDuration } from '@/lib/editUtils';
import { useMemo } from 'react';

interface AudioClipSliderProps {
  originalDuration: number;
  startTime: number;
  endTime: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

export function AudioClipSlider({
  originalDuration,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: AudioClipSliderProps) {
  const clippedDuration = endTime - startTime;

  // 处理滑块值变化
  const handleSliderChange = (values: number[]) => {
    const [newStart, newEnd] = values;
    if (newStart !== startTime) {
      onStartChange(newStart);
    }
    if (newEnd !== endTime) {
      onEndChange(newEnd);
    }
  };

  // 处理开始时间输入
  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value < endTime - 0.1) {
      onStartChange(value);
    }
  };

  // 处理结束时间输入
  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > startTime + 0.1 && value <= originalDuration) {
      onEndChange(value);
    }
  };

  // 计算时间轴刻度
  const timeMarks = useMemo(() => {
    if (originalDuration <= 0) return [];
    const marks: { time: number; percent: number; label: string }[] = [];
    const step = originalDuration <= 5 ? 1 : originalDuration <= 10 ? 2 : 5;
    for (let t = 0; t <= originalDuration; t += step) {
      marks.push({
        time: t,
        percent: (t / originalDuration) * 100,
        label: `${t}s`,
      });
    }
    return marks;
  }, [originalDuration]);

  return (
    <div className="space-y-4">
      {/* 标题和时长预览 */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">音频剪辑</label>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">原时长: {formatDuration(originalDuration)}</span>
          <span className="text-primary font-medium">
            剪辑后: {formatDuration(clippedDuration)}
          </span>
        </div>
      </div>

      {/* 可视化时间轴 */}
      <div className="space-y-1">
        {/* 刻度尺 */}
        <div className="relative h-6 flex items-end">
          {timeMarks.map((mark, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: `${mark.percent}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[10px] text-muted-foreground mb-0.5">{mark.label}</span>
              <div className="w-px h-2 bg-border" />
            </div>
          ))}
        </div>

        {/* 双头滑块区域 */}
        <div className="relative px-2">
          {/* 背景轨道 */}
          <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-muted rounded-full" />

          {/* 选中区域 */}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 bg-primary rounded-full"
            style={{
              left: `${(startTime / originalDuration) * 100}%`,
              width: `${((endTime - startTime) / originalDuration) * 100}%`,
            }}
          />

          {/* 未选中区域（左） */}
          <div
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-muted-foreground/20 rounded-l-full"
            style={{ width: `${(startTime / originalDuration) * 100}%` }}
          />

          {/* 未选中区域（右） */}
          <div
            className="absolute top-1/2 right-0 h-2 -translate-y-1/2 bg-muted-foreground/20 rounded-r-full"
            style={{ width: `${((originalDuration - endTime) / originalDuration) * 100}%` }}
          />

          {/* 双值滑块 */}
          <Slider
            value={[startTime, endTime]}
            min={0}
            max={originalDuration}
            step={0.1}
            onValueChange={handleSliderChange}
            className="relative z-10"
          />
        </div>

        {/* 手柄位置标签 */}
        <div className="relative h-5 px-2">
          <div
            className="absolute text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded"
            style={{ left: `${(startTime / originalDuration) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {startTime.toFixed(1)}s
          </div>
          <div
            className="absolute text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded"
            style={{ left: `${(endTime / originalDuration) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {endTime.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* 快捷按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">快捷:</span>
        <button
          type="button"
          onClick={() => { onStartChange(0); onEndChange(originalDuration); }}
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
        >
          完整
        </button>
        <button
          type="button"
          onClick={() => { onStartChange(0); onEndChange(Math.min(1, originalDuration)); }}
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
        >
          前1秒
        </button>
        <button
          type="button"
          onClick={() => { onStartChange(Math.max(0, originalDuration - 1)); onEndChange(originalDuration); }}
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
        >
          后1秒
        </button>
        {originalDuration >= 3 && (
          <>
            <button
              type="button"
              onClick={() => { onStartChange(0); onEndChange(3); }}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
            >
              前3秒
            </button>
            <button
              type="button"
              onClick={() => { onStartChange(Math.max(0, originalDuration - 3)); onEndChange(originalDuration); }}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
            >
              后3秒
            </button>
          </>
        )}
      </div>

      {/* 精确输入框 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">开始 (s)</label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={startTime.toFixed(1)}
              onChange={handleStartInputChange}
              min={0}
              max={endTime - 0.1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">结束 (s)</label>
          <Input
            type="number"
            value={endTime.toFixed(1)}
            onChange={handleEndInputChange}
            min={startTime + 0.1}
            max={originalDuration}
            step={0.1}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">时长 (s)</label>
          <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50 text-sm">
            <span className="text-muted-foreground">{clippedDuration.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
