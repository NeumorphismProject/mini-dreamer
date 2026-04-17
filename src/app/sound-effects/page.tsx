'use client';

import { useEffect, useState, useCallback } from 'react';
import { audioApi, QueryAudioParams } from '@/services/api';
import { useListStore, useUIStore } from '@/stores';
import type { AudioItem, TagItem } from '@/types';
import { AudioFilters, Pagination, AudioList } from '@/components/list';
import { AudioEditDialog } from '@/components/edit';
import { TagFilterBar, SelectedTagsDisplay, TagSelector } from '@/components/tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AudioWaveform, Plus, Star, ArrowRightFromLine, X, Loader2, Tags } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
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

export default function SoundEffectsPage() {
  const { filters, page, pageSize, setFilters, setPage, setPageSize, setTotal } = useListStore();
  const { openSaveModal } = useUIStore();
  const [items, setItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotalCount] = useState(0);
  const [movingIds, setMovingIds] = useState<Set<number>>(new Set());

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 标签筛选状态
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // 批量添加标签弹窗状态
  const [showBatchTagDialog, setShowBatchTagDialog] = useState(false);
  const [batchSelectedTags, setBatchSelectedTags] = useState<TagItem[]>([]);
  const [isBatchTagging, setIsBatchTagging] = useState(false);

  // 转为精选确认弹窗状态
  const [showPremiumConfirm, setShowPremiumConfirm] = useState(false);
  const [pendingPremiumIds, setPendingPremiumIds] = useState<number[]>([]);
  const [isBatchPremium, setIsBatchPremium] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await audioApi.querySoundEffects({
        ...filters,
        page,
        page_size: pageSize,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      setItems(result.list);
      setTotalCount(result.total);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch sound effects:', error);
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize, setTotal, selectedTagIds]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFiltersChange = (newFilters: Partial<QueryAudioParams>) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleSave = (audio: AudioItem) => {
    openSaveModal(audio, fetchItems);
  };

  const handleMoveToTemp = async (audio: AudioItem) => {
    // 确保有 id
    if (!audio.id) {
      toast.error('音效ID不存在，无法移除');
      return;
    }

    // 添加到移动中状态
    setMovingIds((prev) => new Set(prev).add(audio.id as number));

    try {
      await audioApi.moveToTemp(audio.id);
      toast.success('音效已移除到临时表');

      // 从列表中移除该项
      setItems((prev) => prev.filter((item) => item.id !== audio.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to move to temp:', error);
      toast.error(error instanceof Error ? error.message : '移除失败，请重试');
    } finally {
      // 从移动中状态移除
      setMovingIds((prev) => {
        const next = new Set(prev);
        next.delete(audio.id as number);
        return next;
      });
    }
  };

  // 切换选择模式
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  };

  // 单独转为精选
  const handleMoveToPremium = (audio: AudioItem) => {
    if (!audio.id) return;
    setPendingPremiumIds([audio.id]);
    setIsBatchPremium(false);
    setShowPremiumConfirm(true);
  };

  // 批量转为精选
  const handleBatchMoveToPremium = () => {
    if (selectedIds.size === 0) return;
    setPendingPremiumIds(Array.from(selectedIds));
    setIsBatchPremium(true);
    setShowPremiumConfirm(true);
  };

  // 确认转为精选
  const confirmMoveToPremium = async () => {
    if (pendingPremiumIds.length === 0) return;

    setMovingIds(new Set(pendingPremiumIds));
    setShowPremiumConfirm(false);

    try {
      const result = await audioApi.moveToPremiumLibrary(pendingPremiumIds);

      // 检查结果
      const failedDetails = result.details.filter((d) => d.status === 'failed');
      if (failedDetails.length > 0) {
        toast.warning(`部分音效添加失败：${failedDetails.length} 个`);
      } else {
        toast.success(`已添加 ${result.moved_count} 个音效到精选`);
      }

      // 清除选中状态
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        pendingPremiumIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      // 刷新列表
      fetchItems();
    } catch (error) {
      console.error('Move to premium failed:', error);
      toast.error('添加失败，请重试');
    } finally {
      setMovingIds(new Set());
      setPendingPremiumIds([]);
    }
  };

  // 关闭选择模式
  const cancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // 单个添加标签
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

  // 批量添加标签
  const handleBatchAddTags = async () => {
    if (selectedIds.size === 0 || batchSelectedTags.length === 0) return;

    setIsBatchTagging(true);
    try {
      const tagIds = batchSelectedTags.map((t) => t.id);
      const selectedItems = items.filter((item) => item.id && selectedIds.has(item.id));

      // 为每个音频添加标签
      const results = await Promise.allSettled(
        selectedItems.map((item) => audioApi.addTagsToAudio(item.file_name, tagIds))
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`已为 ${successCount} 个音效添加标签`);

      setShowBatchTagDialog(false);
      setBatchSelectedTags([]);
      fetchItems();
    } catch (error) {
      console.error('Failed to batch add tags:', error);
      toast.error('批量添加标签失败');
    } finally {
      setIsBatchTagging(false);
    }
  };

  const selectableCount = items.filter((i) => i.id).length;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AudioWaveform className="h-6 w-6 text-primary" />
            音效库
          </h1>
          <p className="text-muted-foreground mt-1">
            共 {total} 个音效素材
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagFilterBar
            selectedTagIds={selectedTagIds}
            onTagChange={(ids) => {
              setSelectedTagIds(ids);
              setPage(1);
            }}
          />
          {!isSelectionMode && selectableCount > 0 && (
            <Button
              variant="outline"
              onClick={toggleSelectionMode}
            >
              <Checkbox className="h-4 w-4 mr-2" />
              批量选择
            </Button>
          )}
          <Link href="/premium-sound-effects">
            <Button variant="outline" className="gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-900/30">
              <Star className="h-4 w-4 text-amber-500" />
              精选音效库
            </Button>
          </Link>
          <Link href="/generate?type=sound_effect">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              生成音效
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
                  onCheckedChange={() => {
                    if (selectedIds.size === selectableCount) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(items.filter((i) => i.id).map((i) => i.id as number)));
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  已选择 {selectedIds.size} 项
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {selectedIds.size > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBatchTagDialog(true)}
                      className="gap-1"
                    >
                      <Tags className="h-4 w-4 mr-1" />
                      添加标签 ({selectedIds.size})
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBatchMoveToPremium}
                      disabled={movingIds.size > 0}
                      className="gap-1"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      转为精选 ({selectedIds.size})
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

          <AudioList
            items={items}
            isLoading={isLoading}
            showEdit
            showMoveToTemp
            showMoveToPremium
            showAddTags
            movingIds={movingIds}
            onSave={handleSave}
            onMoveToTemp={handleMoveToTemp}
            onMoveToPremium={handleMoveToPremium}
            onAddTags={handleAddTags}
            emptyText="暂无音效素材"
            emptyAction={{
              label: '生成音效',
              href: '/generate?type=sound_effect',
            }}
          />

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

      {/* 转为精选确认弹窗 */}
      <AlertDialog open={showPremiumConfirm} onOpenChange={setShowPremiumConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBatchPremium ? '批量转为精选' : '转为精选'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBatchPremium
                ? `确定要将选中的 ${pendingPremiumIds.length} 个音效添加到精选音效库吗？`
                : '确定要将这个音效添加到精选音效库吗？'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMoveToPremium}>
              {movingIds.size > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  添加中...
                </>
              ) : (
                '确认添加'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Audio Edit Dialog */}
      <AudioEditDialog />

      {/* 批量添加标签弹窗 */}
      <AlertDialog open={showBatchTagDialog} onOpenChange={setShowBatchTagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>批量添加标签</AlertDialogTitle>
            <AlertDialogDescription>
              为选中的 {selectedIds.size} 个音效添加标签
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <TagSelector
              value={batchSelectedTags.map((t) => t.id)}
              onChange={(ids) => {
                // 保留已有的标签信息，只更新 ID 列表
                const newTags = ids.map((id) => {
                  const existing = batchSelectedTags.find((t) => t.id === id);
                  return existing || { id, tag_name: '', created_at: '', updated_at: '' };
                });
                setBatchSelectedTags(newTags);
              }}
              maxCount={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatchSelectedTags([])}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchAddTags}
              disabled={batchSelectedTags.length === 0 || isBatchTagging}
            >
              {isBatchTagging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  添加中...
                </>
              ) : (
                '确认添加'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
