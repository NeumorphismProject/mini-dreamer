'use client';

import { useState } from 'react';
import type { TagItem } from '@/types';
import { tagApi } from '@/services/api';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const editTagSchema = z.object({
  tag_name: z.string().min(1, '请输入标签名称').max(20, '标签名称最多20个字符'),
  description: z.string().max(100, '描述最多100个字符').optional(),
});

type EditTagFormData = z.infer<typeof editTagSchema>;

interface TagEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagItem | null;
  onSuccess?: () => void;
}

export function TagEditDialog({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: TagEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!tag;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditTagFormData>({
    resolver: zodResolver(editTagSchema),
    defaultValues: {
      tag_name: '',
      description: '',
    },
  });

  // 当弹窗打开或 tag 变化时，重置表单
  useState(() => {
    if (open) {
      if (tag) {
        setValue('tag_name', tag.tag_name);
        setValue('description', tag.description || '');
      } else {
        reset();
      }
    }
  });

  const onSubmit = async (data: EditTagFormData) => {
    setIsLoading(true);

    try {
      if (isEditMode && tag) {
        // 更新标签
        await tagApi.updateTag({
          id: tag.id,
          tag_name: data.tag_name,
          description: data.description || undefined,
        });
        toast.success('标签更新成功');
      } else {
        // 创建标签
        await tagApi.createTag({
          tag_name: data.tag_name,
          description: data.description || undefined,
        });
        toast.success('标签创建成功');
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save tag:', error);
      toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '编辑标签' : '新建标签'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '修改标签的名称和描述'
              : '创建一个新的标签用于标记音频文件'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag_name">标签名称 *</Label>
            <Input
              id="tag_name"
              placeholder="例如：游戏音效"
              {...register('tag_name')}
              maxLength={20}
            />
            {errors.tag_name && (
              <p className="text-sm text-destructive">
                {errors.tag_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="描述标签的用途..."
              rows={3}
              {...register('description')}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {/* 手动跟踪描述长度 */}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
