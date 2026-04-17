'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TagItem } from '@/types';
import { tagApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TagFilterBarProps {
  selectedTagIds: number[];
  onTagChange: (tagIds: number[]) => void;
  variant?: 'default' | 'premium';
}

export function TagFilterBar({
  selectedTagIds,
  onTagChange,
  variant = 'default',
}: TagFilterBarProps) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);

  // 加载标签
  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await tagApi.queryTags({
        page: 1,
        page_size: 100, // 加载足够多的标签
      });
      setTags(result.list);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // 过滤标签
  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchName.toLowerCase())
  );

  // 选中/取消选中
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagChange([...selectedTagIds, tagId]);
    }
  };

  // 清除全部
  const clearAll = () => {
    onTagChange([]);
  };

  // 获取选中标签
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  // 按钮变体
  const buttonVariant = variant === 'premium' ? 'gold' : 'default';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          className={cn(
            'gap-2 transition-all',
            selectedTagIds.length > 0 && 'ring-2 ring-primary/20'
          )}
        >
          <Filter className="h-4 w-4" />
          标签筛选
          {selectedTagIds.length > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 p-0 text-xs justify-center"
            >
              {selectedTagIds.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* 搜索框 */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标签..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>

        {/* 标签列表 */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchName ? '未找到匹配的标签' : '暂无标签'}
            </div>
          ) : (
            <div className="p-2">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-muted',
                    selectedTagIds.includes(tag.id) && 'bg-muted'
                  )}
                >
                  <Checkbox
                    checked={selectedTagIds.includes(tag.id)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{tag.tag_name}</div>
                    {tag.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {tag.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* 底部操作 */}
        {selectedTagIds.length > 0 && (
          <div className="p-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedTagIds.length} 项
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-1" />
              清除
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// 已选中标签展示组件
interface SelectedTagsDisplayProps {
  selectedTagIds: number[];
  onRemove: (tagId: number) => void;
  onClearAll: () => void;
}

export function SelectedTagsDisplay({
  selectedTagIds,
  onRemove,
  onClearAll,
}: SelectedTagsDisplayProps) {
  const [tags, setTags] = useState<TagItem[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      if (selectedTagIds.length === 0) {
        setTags([]);
        return;
      }
      try {
        const result = await tagApi.queryTags({
          page: 1,
          page_size: 100,
        });
        setTags(result.list.filter((t) => selectedTagIds.includes(t.id)));
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, [selectedTagIds]);

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">已选标签：</span>
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
          {tag.tag_name}
          <button
            onClick={() => onRemove(tag.id)}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-xs">
        清除全部
      </Button>
    </div>
  );
}
