'use client';

import { AUDIO_FORMATS, type AudioFormat } from '@/types/audio';
import { cn } from '@/lib/utils';

interface FormatSelectorProps {
  value: AudioFormat;
  onChange: (format: AudioFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {AUDIO_FORMATS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-start p-2 rounded-md border transition-all text-left",
            value === option.value
              ? "bg-primary/10 border-primary text-primary"
              : "bg-background hover:bg-muted border-input hover:border-primary/50"
          )}
        >
          <span className="text-sm font-medium">{option.label}</span>
          <span className="text-[10px] text-muted-foreground">{option.description}</span>
        </button>
      ))}
    </div>
  );
}
