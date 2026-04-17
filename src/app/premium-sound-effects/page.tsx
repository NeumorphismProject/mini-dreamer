'use client';

import { useEffect, useState, useCallback } from 'react';
import { audioApi, QueryPremiumSoundEffectsParams } from '@/services/api';
import { useListStore } from '@/stores';
import { useEditStore } from '@/stores/editStore';
import type { AudioItem, TagItem } from '@/types';
import { AudioFilters, Pagination } from '@/components/list';
import { AudioCard } from '@/components/audio';
import { TagFilterBar, SelectedTagsDisplay } from '@/components/tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, ArrowLeftFromLine, X, Loader2 } from 'lucide-react';
import { AudioEditDialog } from '@/components/edit';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PremiumSoundEffectsPage() {
  const { filters, page, pageSize, setFilters, setPage, setPageSize, setTotal } = useListStore();
  const { openDialog } = useEditStore();
  const [items, setItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotalCount] = useState(0);

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());

  // 标签筛选状态
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // 恢复确认弹窗状态
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreIds, setPendingRestoreIds] = useState<number[]>([]);
  const [isBatchRestore, setIsBatchRestore] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await audioApi.queryPremiumSoundEffects({
        ...filters,
        page,
        page_size: pageSize,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      setItems(result.list);
      setTotalCount(result.total);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch premium sound effects:', error);
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize, setTotal, selectedTagIds]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFiltersChange = (newFilters: Partial<QueryPremiumSoundEffectsParams>) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  // 处理音频编辑
  const handleEdit = (audio: AudioItem) => {
    openDialog([{
      audio_url: audio.audio_url,
      file_name: audio.file_name,
      audio_duration: audio.audio_duration,
      file_format: audio.file_format,
    }]);
  };

  // 切换选择模式
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  };

  // 切换单个选中
  const toggleSelect = (audio: AudioItem) => {
    if (!audio.id) return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(audio.id)) {
      newSelected.delete(audio.id);
    } else {
      newSelected.add(audio.id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === items.filter((i) => i.id).length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.filter((i) => i.id).map((i) => i.id as number)));
    }
  };

  // 关闭选择模式
  const cancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // 添加标签
  const handleAddTags = async (audio: AudioItem, tags: TagItem[]) => {
    if (!audio.file_name) return;
    try {
      await audioApi.addTagsToAudio(audio.file_name, tags.map((t) => t.id));
      toast.success('标签添加成功');
      fetchItems();
    } catch (error) {
      console.error('Failed to add tags:', error);
      toast.error('标签添加失败');
    }
  };

  // 单独恢复
  const handleRestore = (audio: AudioItem) => {
    if (!audio.id) return;
    setPendingRestoreIds([audio.id]);
    setIsBatchRestore(false);
    setShowRestoreConfirm(true);
  };

  // 批量恢复
  const handleBatchRestore = () => {
    if (selectedIds.size === 0) return;
    setPendingRestoreIds(Array.from(selectedIds));
    setIsBatchRestore(true);
    setShowRestoreConfirm(true);
  };

  // 确认恢复
  const confirmRestore = async () => {
    if (pendingRestoreIds.length === 0) return;

    setRestoringIds(new Set(pendingRestoreIds));
    setShowRestoreConfirm(false);

    try {
      const result = await audioApi.restoreFromPremiumLibrary(pendingRestoreIds);

      // 检查结果
      const failedDetails = result.details.filter((d) => d.status === 'failed');
      if (failedDetails.length > 0) {
        toast.warning(`部分音频恢复失败：${failedDetails.length} 个`);
      } else {
        toast.success(`已恢复 ${result.restored_count} 个音效到音效库`);
      }

      // 清除选中状态
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        pendingRestoreIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      // 刷新列表
      fetchItems();
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('恢复失败，请重试');
    } finally {
      setRestoringIds(new Set());
      setPendingRestoreIds([]);
    }
  };

  const selectableCount = items.filter((i) => i.id).length;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            精选音效库
          </h1>
          <p className="text-muted-foreground mt-1">
            精心挑选的优质音效，共 {total} 个
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagFilterBar
            selectedTagIds={selectedTagIds}
            onTagChange={(ids) => {
              setSelectedTagIds(ids);
              setPage(1);
            }}
            variant="premium"
          />
          {!isSelectionMode && selectableCount > 0 && (
            <Button
              variant="outline"
              onClick={toggleSelectionMode}
              className="border-amber-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-900/30"
            >
              <Checkbox className="h-4 w-4 mr-2" />
              批量选择
            </Button>
          )}
          <Link href="/sound-effects">
            <Button variant="outline" className="gap-2">
              <ArrowLeftFromLine className="h-4 w-4" />
              返回音效库
            </Button>
          </Link>
        </div>
      </div>

      {/* 标签筛选结果展示 */}
      {selectedTagIds.length > 0 && (
        <div className="mb-4">
          <SelectedTagsDisplay
            selectedTagIds={selectedTagIds}
            onRemove={(id) => {
              setSelectedTagIds((prev) => prev.filter((tid) => tid !== id));
              setPage(1);
            }}
            onClearAll={() => {
              setSelectedTagIds([]);
              setPage(1);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">筛选</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleReset}
                audioType="sound_effect"
              />
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          {/* 批量操作工具栏 */}
          {isSelectionMode && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === selectableCount && selectableCount > 0}
                  onCheckedChange={toggleSelectAll}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  已选择 {selectedIds.size} 项
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {selectedIds.size > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBatchRestore}
                    disabled={restoringIds.size > 0}
                    className="gap-1"
                  >
                    <ArrowLeftFromLine className="h-4 w-4 mr-1" />
                    恢复 {selectedIds.size} 项
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={cancelSelection}>
                  <X className="h-4 w-4 mr-1" />
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 音频列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-lg border bg-card animate-pulse"
                />
              ))
            ) : items.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">暂无精选音效</p>
                <p className="text-sm text-muted-foreground mb-4">
                  从音效库中选择优质音效添加到精选
                </p>
                <Link href="/sound-effects">
                  <Button>前往音效库</Button>
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemId = String(item.id || item.file_name);
                const isSelected = item.id ? selectedIds.has(item.id) : false;
                const isRestoring = item.id ? restoringIds.has(item.id) : false;

                return (
                  <AudioCard
                    key={itemId}
                    audio={item}
                    showEdit
                    showAddTags
                    showRestoreFromPremium
                    showCheckbox={isSelectionMode}
                    isSelected={isSelected}
                    isMoving={isRestoring}
                    onSelect={() => toggleSelect(item)}
                    onEdit={() => handleEdit(item)}
                    onAddTags={handleAddTags}
                    onRestoreFromPremium={() => handleRestore(item)}
                  />
                );
              })
            )}
          </div>

          {total > 0 && (
            <div className="mt-6">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      </div>

      {/* 恢复确认弹窗 */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBatchRestore ? '批量移出精品库' : '移出精品库'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBatchRestore
                ? `确定要将选中的 ${pendingRestoreIds.length} 个精选音效移出精品库，转移到音效库吗？`
                : '确定要将这个精选音效移出精品库，转移到音效库吗？'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              {restoringIds.size > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  移出中...
                </>
              ) : (
                '确认移出'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Audio Edit Dialog */}
      <AudioEditDialog />
    </div>
  );
}
