'use client';

import { useState, useMemo } from 'react';
import { OutputAudio } from '@/stores/editStore';
import { audioApi } from '@/services/api';
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
import { Loader2, Music } from 'lucide-react';

/**
 * 从文件名中解析风格类型
 * 文件名格式: se_{风格类型}_edited_{时间戳}_{随机串}.{扩展名}
 * 例如: se_机械_edited_1776240002_64318e23.mp3 -> 机械
 */
function parseStyleTypeFromFileName(fileName: string): string | null {
  const match = fileName.match(/^se_(.+?)_edited_/);
  return match ? match[1] : null;
}

interface SaveOutputsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audios: OutputAudio[];
  onSuccess?: () => void;
}

export function SaveOutputsDialog({
  open,
  onOpenChange,
  audios,
  onSuccess,
}: SaveOutputsDialogProps) {
  const [audioName, setAudioName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从音频列表获取风格类型（优先使用 style_type，否则从 file_name 解析）
  // 如果有多个不同则显示"混合"
  const styleType = useMemo(() => {
    const types = audios.map((a) => {
      // 优先使用 style_type 字段
      if (a.style_type) return a.style_type;
      // 否则从 file_name 解析
      return parseStyleTypeFromFileName(a.file_name);
    }).filter(Boolean) as string[];
    
    if (types.length === 0) return null;
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes.length === 1 ? uniqueTypes[0] : '混合';
  }, [audios]);

  const handleClose = () => {
    setAudioName('');
    setDescription('');
    setError(null);
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!audioName.trim()) {
      setError('请输入音频名称');
      return;
    }

    // 检查是否有 temp_id
    const audiosWithoutTempId = audios.filter((a) => !a.temp_id);
    if (audiosWithoutTempId.length > 0) {
      setError(`${audiosWithoutTempId.length} 个音频无法保存（缺少临时记录ID）`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 遍历所有音频并保存
      const savePromises = audios.map((audio) =>
        audioApi.saveAudio({
          temp_id: audio.temp_id as number,
          audio_name: audioName.trim(),
          audio_type: 'sound_effect',
          description: description.trim(),
        })
      );

      await Promise.all(savePromises);

      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>保存到音效库</DialogTitle>
          <DialogDescription>
            将 {audios.length} 个编辑后的音频保存到音效库
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 音频名称 */}
          <div className="space-y-2">
            <Label htmlFor="audio_name">音频名称 *</Label>
            <Input
              id="audio_name"
              placeholder="例如：编辑后的玻璃破碎声"
              value={audioName}
              onChange={(e) => setAudioName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 风格类型（只读展示） */}
          <div className="space-y-2">
            <Label>风格类型</Label>
            <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm">
              {styleType ? (
                <Badge variant="outline" className="mr-2">
                  {styleType}
                </Badge>
              ) : (
                <span className="text-muted-foreground">未知</span>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="描述音频的使用场景或特点..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* 音频列表预览 */}
          <div className="space-y-2">
            <Label>待保存音频 ({audios.length})</Label>
            <div className="max-h-[120px] overflow-y-auto space-y-2 rounded-md border p-2">
              {audios.map((audio, index) => {
                // 获取风格类型：优先使用 style_type，否则从 file_name 解析
                const audioStyleType = audio.style_type || parseStyleTypeFromFileName(audio.file_name);
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Music className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{audio.file_name}</span>
                      {audioStyleType && (
                        <Badge variant="secondary" className="text-xs py-0 px-1 flex-shrink-0">
                          {audioStyleType}
                        </Badge>
                      )}
                    </div>
                    {!audio.temp_id && (
                      <span className="text-xs text-destructive ml-2 flex-shrink-0">
                        无法保存
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
