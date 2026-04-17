'use client';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const PRESET_VALUES = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">音量调整</label>
        <span className="text-sm font-medium text-primary">{value.toFixed(1)}x</span>
      </div>

      <Slider
        value={[value]}
        min={0}
        max={5}
        step={0.1}
        onValueChange={(values) => onChange(values[0])}
        className="w-full"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0.0</span>
        <span>5.0</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_VALUES.map((preset) => (
          <Button
            key={preset}
            variant={value === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset)}
            className="h-8 px-3 text-xs"
          >
            {preset}x
          </Button>
        ))}
      </div>
    </div>
  );
}
