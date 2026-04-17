'use client';

import { Input } from '@/components/ui/input';

interface FadeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
}

export function FadeInput({ label, value, onChange, maxValue = 10000 }: FadeInputProps) {
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={0}
          max={maxValue}
          className="w-32"
        />
        <span className="text-sm text-muted-foreground">ms</span>
      </div>

      <p className="text-xs text-muted-foreground">0 - {maxValue} ms</p>
    </div>
  );
}
