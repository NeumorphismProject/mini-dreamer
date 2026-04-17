'use client';

import { X, Volume2 } from 'lucide-react';
import { SelectedAudio } from '@/stores/editStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SelectedAudiosProps {
  audios: SelectedAudio[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export function SelectedAudios({ audios, onRemove, onClearAll }: SelectedAudiosProps) {
  if (audios.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          已选择: {audios.length} 个音频
        </span>
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-7">
          全部移除
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {audios.map((audio, index) => (
          <Badge
            key={`${audio.audio_url}-${index}`}
            variant="secondary"
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 h-8"
          >
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm max-w-[150px] truncate">{audio.file_name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
