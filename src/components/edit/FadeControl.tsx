'use client';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface FadeControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
}

const PRESET_VALUES = [0, 500, 1000, 2000, 3000];

export function FadeControl({ label, value, onChange, maxValue = 10000 }: FadeControlProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onChange(Math.min(newValue, maxValue));
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    if (value < 0) {
      onChange(0);
    } else if (value > maxValue) {
      onChange(maxValue);
    }
  };

  // 格式化显示时间
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-2">
      {/* 标签和值显示 */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            min={0}
            max={maxValue}
            className="w-16 h-6 text-xs text-right px-2"
          />
          <span className="text-xs text-muted-foreground w-6">ms</span>
        </div>
      </div>

      {/* 滑块 */}
      <Slider
        value={[value]}
        min={0}
        max={maxValue}
        step={100}
        onValueChange={(values) => onChange(values[0])}
        className="w-full"
      />

      {/* 预设按钮 */}
      <div className="flex flex-wrap gap-1">
        {PRESET_VALUES.filter(v => v <= maxValue).map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
              value === preset
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-input'
            }`}
          >
            {formatTime(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
