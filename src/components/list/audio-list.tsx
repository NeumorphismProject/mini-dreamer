'use client';

import { useState } from 'react';
import { AudioCard } from '@/components/audio';
import type { AudioItem, TagItem } from '@/types';
import { useEditStore } from '@/stores/editStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Music, Edit, X, Star, ArrowLeftFromLine, Tags } from 'lucide-react';

interface AudioListProps {
  items: AudioItem[];
  isLoading?: boolean;
  showSave?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
  showJsonView?: boolean;
  showMoveToTemp?: boolean;
  showMoveToPremium?: boolean;
  showRestoreFromPremium?: boolean;
  showAddTags?: boolean;
  movingIds?: Set<number | string>;
  onSave?: (audio: AudioItem) => void;
  onDelete?: (audio: AudioItem) => void;
  onMoveToTemp?: (audio: AudioItem) => void;
  onMoveToPremium?: (audio: AudioItem) => void;
  onRestoreFromPremium?: (audio: AudioItem) => void;
  onAddTags?: (audio: AudioItem, tags: TagItem[]) => void;
  emptyText?: string;
  emptyAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function AudioList({
  items,
  isLoading,
  showSave = false,
  showDelete = false,
  showEdit = false,
  showJsonView = false,
  showMoveToTemp = false,
  showMoveToPremium = false,
  showRestoreFromPremium = false,
  showAddTags = false,
  movingIds = new Set(),
  onSave,
  onDelete,
  onMoveToTemp,
  onMoveToPremium,
  onRestoreFromPremium,
  onAddTags,
  emptyText = '暂无音频',
  emptyAction,
}: AudioListProps) {
  const { openDialog } = useEditStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = (audio: AudioItem) => {
    const id = String(audio.id || audio.temp_id || audio.file_name);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => String(item.id || item.temp_id || item.file_name))));
    }
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBatchEdit = () => {
    const selectedAudios = items
      .filter((item) => selectedIds.has(String(item.id || item.temp_id || item.file_name)))
      .map((audio) => ({
        audio_url: audio.audio_url,
        file_name: audio.file_name,
        audio_duration: audio.audio_duration,
        file_format: audio.file_format,
      }));

    if (selectedAudios.length > 0) {
      openDialog(selectedAudios);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-lg border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Music className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">{emptyText}</p>
        <p className="text-sm text-muted-foreground mb-4">
          开始创建您的第一个音频素材
        </p>
        {emptyAction && (
          emptyAction.href ? (
            <Button asChild>
              <a href={emptyAction.href}>{emptyAction.label}</a>
            </Button>
          ) : (
            <Button onClick={emptyAction.onClick}>
              {emptyAction.label}
            </Button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch selection toolbar */}
      {isSelectionMode && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === items.length && items.length > 0}
              onCheckedChange={selectAll}
              className="h-4 w-4"
            />
            <span className="text-sm">
              已选择 {selectedIds.size} 项
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {selectedIds.size > 0 && (
              <>
                {showMoveToPremium && onMoveToPremium && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedAudios = items.filter((item) => selectedIds.has(String(item.id || item.temp_id || item.file_name)));
                      selectedAudios.forEach((audio) => onMoveToPremium(audio));
                    }}
                    className="gap-1"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    转为精选 ({selectedIds.size})
                  </Button>
                )}
                <Button size="sm" onClick={handleBatchEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  批量编辑
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={cancelSelection}>
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
          </div>
        </div>
      )}

      {/* Audio grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const itemId = String(item.id || item.temp_id || item.file_name);
          const isSelected = selectedIds.has(itemId);
          const isMoving = movingIds.has(item.id as number);

          return (
            <AudioCard
              key={itemId}
              audio={item}
              showSave={showSave}
              showDelete={showDelete}
              showEdit={showEdit}
              showJsonView={showJsonView}
              showMoveToTemp={showMoveToTemp}
              showMoveToPremium={showMoveToPremium}
              showRestoreFromPremium={showRestoreFromPremium}
              showAddTags={showAddTags}
              showCheckbox={isSelectionMode}
              isSelected={isSelected}
              isMoving={isMoving}
              onSelect={() => toggleSelection(item)}
              onSave={onSave}
              onDelete={onDelete}
              onMoveToTemp={onMoveToTemp}
              onMoveToPremium={onMoveToPremium}
              onRestoreFromPremium={onRestoreFromPremium}
              onAddTags={onAddTags}
            />
          );
        })}
      </div>
    </div>
  );
}
