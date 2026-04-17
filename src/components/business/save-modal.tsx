'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores';
import { audioApi } from '@/services/api';
import type { AudioItem } from '@/types';
import { TagSelector } from '@/components/tag';
import {
  getAudioCategoryLabel,
  getAudioCategoryStyle,
} from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TagItem } from '@/types';

const saveSchema = z.object({
  audio_name: z.string().min(1, '请输入音频名称'),
  description: z.string().optional(),
});

type SaveFormData = z.infer<typeof saveSchema>;

export function SaveModal() {
  const { saveModal, closeSaveModal } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SaveFormData>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      audio_name: '',
      description: '',
    },
  });

  // 当弹窗打开且音频有已有标签时，初始化 selectedTags
  useEffect(() => {
    if (saveModal.isOpen && saveModal.audio?.tags && saveModal.audio.tags.length > 0) {
      setSelectedTags(saveModal.audio.tags);
    }
  }, [saveModal.isOpen, saveModal.audio]);

  const onSubmit = async (data: SaveFormData) => {
    if (!saveModal.audio) return;

    // 支持 temp_id 和 id，优先使用 temp_id
    const recordId = saveModal.audio.temp_id ?? saveModal.audio.id;
    if (!recordId) {
      setError('记录ID不存在');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await audioApi.saveAudio({
        temp_id: recordId as number,
        audio_name: data.audio_name,
        audio_type: 'sound_effect', // 默认值，实际应该根据 audio 判断
        description: data.description || '',
        tag_ids: selectedTags.length > 0 ? selectedTags.map((t) => t.id).join(',') : undefined,
      });

      reset();
      setSelectedTags([]);
      closeSaveModal();
      saveModal.onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setError(null);
      setSelectedTags([]);
      closeSaveModal();
    }
  };

  return (
    <Dialog open={saveModal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {saveModal.audio && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium',
                  getAudioCategoryStyle(saveModal.audio.file_name)
                )}
              >
                {getAudioCategoryLabel(saveModal.audio.file_name)}
              </Badge>
            )}
            <DialogTitle>保存音频</DialogTitle>
          </div>
          <DialogDescription>
            为您的音频设置名称和描述，以便日后查找
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio_name">音频名称 *</Label>
            <Input
              id="audio_name"
              placeholder="例如：玻璃破碎声"
              {...register('audio_name')}
            />
            {errors.audio_name && (
              <p className="text-sm text-destructive">{errors.audio_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="描述音频的使用场景或特点..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>标签（可选，最多3个）</Label>
            <TagSelector
              value={selectedTags.map((t) => t.id)}
              onChange={(ids) => {
                // 保留已有的标签信息，只更新 ID 列表
                const newTags = ids.map((id) => {
                  const existing = selectedTags.find((t) => t.id === id);
                  return existing || { id, tag_name: '', created_at: '', updated_at: '' };
                });
                setSelectedTags(newTags);
              }}
              maxCount={3}
              initialTags={saveModal.audio?.tags}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
