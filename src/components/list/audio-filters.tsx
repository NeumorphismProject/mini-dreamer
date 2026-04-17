'use client';

import type { AudioFormat } from '@/types';
import { AUDIO_FORMATS, SOUND_EFFECT_STYLES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

// 特殊值用于表示"全部"选项
const ALL_VALUE = '__all__';

interface AudioFiltersProps {
  filters: {
    file_name?: string;
    file_format?: AudioFormat;
    audio_duration_min?: number;
    audio_duration_max?: number;
    file_size_min?: number;
    file_size_max?: number;
    style_type?: string;
    description?: string;
  };
  onFiltersChange: (filters: Partial<AudioFiltersProps['filters']>) => void;
  onReset: () => void;
  audioType?: 'sound_effect';
}

export function AudioFilters({
  filters,
  onFiltersChange,
  onReset,
  audioType = 'sound_effect',
}: AudioFiltersProps) {
  const styles = SOUND_EFFECT_STYLES;

  const handleDurationChange = (values: number[]) => {
    onFiltersChange({
      audio_duration_min: values[0] > 0 ? values[0] : undefined,
      audio_duration_max: values[1] < 30 ? values[1] : undefined,
    });
  };

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ''
  );

  const handleFormatChange = (value: string) => {
    onFiltersChange({ 
      file_format: value === ALL_VALUE ? undefined : (value as AudioFormat) 
    });
  };

  const handleStyleChange = (value: string) => {
    onFiltersChange({ 
      style_type: value === ALL_VALUE ? undefined : value 
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      {/* Search */}
      <div className="space-y-2">
        <Label>搜索</Label>
        <Input
          placeholder="搜索文件名或描述..."
          value={filters.file_name || ''}
          onChange={(e) => onFiltersChange({ file_name: e.target.value || undefined })}
        />
      </div>

      {/* Format & Style */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>文件格式</Label>
          <Select
            value={filters.file_format || ALL_VALUE}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="全部格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部格式</SelectItem>
              {AUDIO_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>风格类型</Label>
          <Select
            value={filters.style_type || ALL_VALUE}
            onValueChange={handleStyleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="全部风格" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部风格</SelectItem>
              {styles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>时长范围</Label>
          <span className="text-sm text-muted-foreground">
            {filters.audio_duration_min !== undefined || filters.audio_duration_max !== undefined
              ? `${filters.audio_duration_min || 0}秒 - ${filters.audio_duration_max || 30}秒`
              : '不限'}
          </span>
        </div>
        <Slider
          value={[
            filters.audio_duration_min || 0,
            filters.audio_duration_max || 30,
          ]}
          min={0}
          max={30}
          step={1}
          onValueChange={handleDurationChange}
        />
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onReset}>
          <X className="h-4 w-4" />
          重置筛选
        </Button>
      )}
    </div>
  );
}
