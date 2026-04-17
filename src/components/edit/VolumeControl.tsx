'use client';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
}

const PRESET_VALUES = [0.5, 1.0, 1.5, 2.0, 3.0];

export function VolumeControl({ value, onChange }: VolumeControlProps) {
  // 获取音量图标
  const getVolumeIcon = () => {
    if (value === 0) return <VolumeX className="h-4 w-4" />;
    if (value < 1) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // 音量级别描述
  const getVolumeLabel = () => {
    if (value === 0) return '静音';
    if (value === 1) return '原始';
    if (value < 1) return '降低';
    return '放大';
  };

  return (
    <div className="space-y-3">
      {/* 音量显示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getVolumeIcon()}
          <span className="text-sm text-muted-foreground">{getVolumeLabel()}</span>
        </div>
        <span className="text-sm font-mono font-medium text-primary">{value.toFixed(1)}x</span>
      </div>

      {/* 滑块 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-8">0</span>
        <Slider
          value={[value]}
          min={0}
          max={5}
          step={0.1}
          onValueChange={(values) => onChange(values[0])}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">5</span>
      </div>

      {/* 预设按钮 */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_VALUES.map((preset) => (
          <Button
            key={preset}
            variant={Math.abs(value - preset) < 0.05 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset)}
            className="h-7 px-2.5 text-xs font-mono"
          >
            {preset}x
          </Button>
        ))}
      </div>
    </div>
  );
}
