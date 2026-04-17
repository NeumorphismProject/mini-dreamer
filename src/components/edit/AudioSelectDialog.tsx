'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { audioApi } from '@/services/api';
import type { AudioItem } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Music, 
  Star, 
  Clock, 
  Search, 
  Loader2, 
  Check,
  AudioWaveform
} from 'lucide-react';
import { formatDuration } from '@/lib/editUtils';
import type { AudioFormat } from '@/types/audio';

// 列表类型定义
type ListType = 'sound-effects' | 'premium' | 'temp-audio';

interface ListOption {
  key: ListType;
  label: string;
  icon: typeof Music;
  description: string;
}

const LIST_OPTIONS: ListOption[] = [
  { key: 'sound-effects', label: '音效库', icon: AudioWaveform, description: '常规音效素材' },
  { key: 'premium', label: '精选音效', icon: Star, description: '精品音效素材' },
  { key: 'temp-audio', label: '临时音频', icon: Clock, description: '临时存储的音频' },
];

interface AudioSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (audio: { audio_url: string; file_name: string; audio_duration?: number; file_format?: AudioFormat }) => void;
}

export function AudioSelectDialog({ open, onOpenChange, onSelect }: AudioSelectDialogProps) {
  const [selectedList, setSelectedList] = useState<ListType>('sound-effects');
  const [items, setItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // 获取音频列表
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let result;
      const params = {
        page,
        page_size: pageSize,
        file_name: searchKeyword || undefined,
      };

      switch (selectedList) {
        case 'sound-effects':
          result = await audioApi.querySoundEffects(params);
          break;
        case 'premium':
          result = await audioApi.queryPremiumSoundEffects(params);
          break;
        case 'temp-audio':
          result = await audioApi.queryTempAudio(params);
          break;
      }

      setItems(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch audio list:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedList, page, searchKeyword]);

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open, fetchItems]);

  // 切换列表类型时重置
  useEffect(() => {
    setPage(1);
    setSelectedAudio(null);
    setSearchKeyword('');
  }, [selectedList]);

  // 处理搜索
  const handleSearch = () => {
    setPage(1);
    fetchItems();
  };

  // 处理选择
  const handleConfirm = () => {
    if (selectedAudio) {
      onSelect({
        audio_url: selectedAudio.audio_url,
        file_name: selectedAudio.file_name,
        audio_duration: selectedAudio.audio_duration,
        file_format: selectedAudio.file_format as AudioFormat,
      });
      onOpenChange(false);
      // 重置状态
      setSelectedAudio(null);
      setSearchKeyword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="!w-[600px] !max-w-none h-[70vh] max-h-[70vh] p-0 gap-0 flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">选择音频</DialogTitle>
              <DialogDescription className="text-xs">
                从列表中选择一个音频进行编辑
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* 列表类型选择 */}
        <div className="flex gap-2 px-4 py-3 border-b flex-shrink-0">
          {LIST_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = selectedList === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setSelectedList(option.key)}
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                  isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-input hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-2 px-4 py-2 border-b flex-shrink-0">
          <Input
            placeholder="搜索文件名..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* 音频列表 */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mb-3 opacity-50" />
                <p>暂无音频</p>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((audio) => (
                  <button
                    key={audio.id || audio.audio_url}
                    onClick={() => setSelectedAudio(audio)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      selectedAudio?.audio_url === audio.audio_url
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-input hover:bg-muted/50"
                    )}
                  >
                    {/* 选择指示器 */}
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0",
                      selectedAudio?.audio_url === audio.audio_url
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}>
                      {selectedAudio?.audio_url === audio.audio_url && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>

                    {/* 音频信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{audio.file_name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {audio.description || '无描述'}
                      </div>
                    </div>

                    {/* 时长 */}
                    <div className="text-xs text-muted-foreground flex-shrink-0 font-mono">
                      {formatDuration(audio.audio_duration || 0)}
                    </div>

                    {/* 格式 */}
                    <div className="text-xs px-1.5 py-0.5 rounded bg-muted flex-shrink-0 uppercase">
                      {audio.file_format || 'MP3'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30 flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedAudio ? (
              <span>已选择: <span className="font-medium text-foreground">{selectedAudio.file_name}</span></span>
            ) : (
              <span>共 {total} 个音频</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAudio}>
              确认选择
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
