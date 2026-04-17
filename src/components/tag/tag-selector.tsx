'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTagStore } from '@/stores';
import { tagApi } from '@/services/api';
import type { TagItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Check, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const createTagSchema = z.object({
  tag_name: z.string().min(1, '请输入标签名称').max(20, '标签名称最多20个字符'),
  description: z.string().max(100, '描述最多100个字符').optional(),
});

type CreateTagFormData = z.infer<typeof createTagSchema>;

interface TagSelectorProps {
  value: number[];
  onChange: (ids: number[]) => void;
  maxCount?: number;
  placeholder?: string;
  disabled?: boolean;
  /** 外部传入的已选标签数据，用于在未加载标签列表时显示已选标签 */
  initialTags?: TagItem[];
}

export function TagSelector({
  value,
  onChange,
  maxCount = 3,
  placeholder = '选择标签',
  disabled = false,
  initialTags = [],
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createTagName, setCreateTagName] = useState('');

  const listRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  // 防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 加载标签
  const loadTags = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await tagApi.queryTags({
        page: currentPage,
        page_size: pageSize,
        tag_name: debouncedSearch || undefined,
      });

      if (reset) {
        setTags(result.list);
      } else {
        setTags((prev) => [...prev, ...result.list]);
      }
      setTotal(result.total);
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to load tags:', error);
      toast.error('加载标签失败');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [debouncedSearch, page]);

  // 初始加载
  useEffect(() => {
    if (open) {
      loadTags(true);
    }
  }, [open, debouncedSearch]);

  // 滚动加载更多
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoadingMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      if (tags.length < total) {
        setPage((prev) => prev + 1);
        loadTags(false);
      }
    }
  }, [tags.length, total, isLoadingMore, isLoading, loadTags]);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', handleScroll);
      return () => list.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 选择/取消选择标签
  const handleSelect = (tag: TagItem) => {
    if (value.includes(tag.id)) {
      onChange(value.filter((id) => id !== tag.id));
    } else {
      if (value.length >= maxCount) {
        toast.error(`最多只能选择 ${maxCount} 个标签`);
        return;
      }
      onChange([...value, tag.id]);
    }
  };

  // 创建标签
  const handleCreateTag = async () => {
    if (!createTagName.trim()) return;

    setIsCreating(true);
    try {
      const newTag = await tagApi.createTag({
        tag_name: createTagName.trim(),
      });

      // 添加到列表顶部
      setTags((prev) => [newTag, ...prev]);
      setTotal((prev) => prev + 1);

      // 如果还没选满，自动选中
      if (value.length < maxCount) {
        onChange([...value, newTag.id]);
      }

      setShowCreateDialog(false);
      setCreateTagName('');
      toast.success('标签创建成功');
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error(error instanceof Error ? error.message : '创建标签失败');
    } finally {
      setIsCreating(false);
    }
  };

  // 获取已选标签详情
  // 优先使用 tags 中加载的数据，其次使用 initialTags 中的数据
  const selectedTags = value.map((id) => {
    // 先从已加载的 tags 中查找
    const loadedTag = tags.find((tag) => tag.id === id);
    if (loadedTag) return loadedTag;
    
    // 再从 initialTags 中查找
    const initialTag = initialTags.find((tag) => tag.id === id);
    if (initialTag) return initialTag;
    
    // 都找不到，返回一个占位对象
    return { id, tag_name: `标签 ${id}`, created_at: '', updated_at: '' };
  });

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'w-full justify-between min-h-[40px]',
              value.length > 0 && 'h-auto py-1'
            )}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs h-6 gap-1"
                  >
                    {tag.tag_name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(tag);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <Tag className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索标签..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList ref={listRef} className="max-h-[300px]">
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  '未找到标签'
                )}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={String(tag.id)}
                    onSelect={() => handleSelect(tag)}
                    className="cursor-pointer"
                    disabled={!value.includes(tag.id) && value.length >= maxCount}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{tag.tag_name}</span>
                      {tag.description && (
                        <span className="text-xs text-muted-foreground">
                          {tag.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => {
                setShowCreateDialog(true);
                setSearch('');
              }}
            >
              <Plus className="h-4 w-4" />
              新建标签
            </Button>
          </div>
          {value.length > 0 && (
            <div className="border-t p-2 text-xs text-muted-foreground text-center">
              已选择 {value.length}/{maxCount} 个标签
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* 新建标签弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>新建标签</DialogTitle>
            <DialogDescription>
              创建一个新的标签，稍后可将其添加到音频文件
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tag_name">标签名称 *</Label>
              <Input
                id="tag_name"
                placeholder="例如：游戏音效"
                value={createTagName}
                onChange={(e) => setCreateTagName(e.target.value)}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground text-right">
                {createTagName.length}/20
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setCreateTagName('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!createTagName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
