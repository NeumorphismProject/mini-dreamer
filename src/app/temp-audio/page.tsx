'use client';

import { useEffect, useState, useCallback } from 'react';
import { audioApi, QueryTempAudioParams } from '@/services/api';
import { useListStore, useUIStore } from '@/stores';
import type { AudioItem, TagItem } from '@/types';
import { AudioFilters, Pagination } from '@/components/list';
import { AudioCard } from '@/components/audio';
import { TagFilterBar, SelectedTagsDisplay } from '@/components/tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { AudioEditDialog, TrashCleanupDialog } from '@/components/edit';
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

export default function TempAudioPage() {
  const { filters, page, pageSize, setFilters, setPage, setPageSize, setTotal } = useListStore();
  const { openSaveModal } = useUIStore();
  const [items, setItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotalCount] = useState(0);

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // 标签筛选状态
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // 垃圾文件弹窗
  const [showTrashDialog, setShowTrashDialog] = useState(false);

  // 删除确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await audioApi.queryTempAudio({
        ...filters,
        page,
        page_size: pageSize,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      setItems(result.list);
      setTotalCount(result.total);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch temp audio:', error);
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize, setTotal, selectedTagIds]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFiltersChange = (newFilters: Partial<QueryTempAudioParams>) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleSave = (audio: AudioItem) => {
    openSaveModal(audio, fetchItems);
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

  // 单独删除
  const handleDelete = (audio: AudioItem) => {
    if (!audio.id) return;
    setPendingDeleteIds([audio.id]);
    setIsBatchDelete(false);
    setShowDeleteConfirm(true);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setPendingDeleteIds(Array.from(selectedIds));
    setIsBatchDelete(true);
    setShowDeleteConfirm(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (pendingDeleteIds.length === 0) return;

    setDeletingIds(new Set(pendingDeleteIds));
    setShowDeleteConfirm(false);

    try {
      const result = await audioApi.deleteTempAudio(pendingDeleteIds);
      
      // 检查结果
      const failedDetails = result.details.filter((d) => d.status === 'failed');
      if (failedDetails.length > 0) {
        toast.warning(`部分音频删除失败：${failedDetails.length} 个`);
      } else {
        toast.success(`已删除 ${result.marked_count} 个音频`);
      }

      // 清除选中状态
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        pendingDeleteIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      // 刷新列表
      fetchItems();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeletingIds(new Set());
      setPendingDeleteIds([]);
    }
  };

  const selectableCount = items.filter((i) => i.id).length;

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            临时音频
          </h1>
          <p className="text-muted-foreground mt-1">
            临时音频将在7天后自动清理，请及时保存
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
          <Button
            variant="outline"
            onClick={() => setShowTrashDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            垃圾文件
          </Button>
          <Button asChild className="gap-2">
            <Link href="/generate">
              <Plus className="h-4 w-4" />
              生成音频
            </Link>
          </Button>
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
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                    disabled={deletingIds.size > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除 ({selectedIds.size})
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
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">暂无临时音频</p>
                <p className="text-sm text-muted-foreground mb-4">
                  开始创建您的第一个音频素材
                </p>
                <Button asChild>
                  <Link href="/generate">生成音频</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const itemId = String(item.id || item.file_name);
                const isSelected = item.id ? selectedIds.has(item.id) : false;
                const isDeleting = item.id ? deletingIds.has(item.id) : false;

                return (
                  <AudioCard
                    key={itemId}
                    audio={item}
                    showSave
                    saveButtonLabel="加入音效库"
                    showDelete
                    showEdit
                    showJsonView
                    showAddTags
                    showViewVideo
                    showCheckbox={isSelectionMode}
                    isSelected={isSelected}
                    onSelect={() => toggleSelect(item)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onAddTags={handleAddTags}
                  />
                );
              })
            )}
          </div>

          {total > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {total} 个音频
                {!isSelectionMode && selectableCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={toggleSelectionMode}
                  >
                    批量选择
                  </Button>
                )}
              </div>
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

      {/* Audio Edit Dialog */}
      <AudioEditDialog onConfirmClose={fetchItems} />

      {/* 垃圾文件弹窗 */}
      <TrashCleanupDialog
        open={showTrashDialog}
        onOpenChange={setShowTrashDialog}
        onCleanupSuccess={fetchItems}
      />

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {isBatchDelete
                ? `确定要删除选中的 ${pendingDeleteIds.length} 个临时音频吗？删除后可从垃圾文件中恢复。`
                : '确定要删除这个临时音频吗？删除后可从垃圾文件中恢复。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteIds([])}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
