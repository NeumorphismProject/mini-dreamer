'use client';

import { useState, useEffect, useCallback } from 'react';
import { audioApi } from '@/services/api';
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/utils';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, Trash2, Search, Music, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrashItem {
  id: number;
  audio_url: string;
  file_name: string;
  description: string;
  deleted_at: string;
  audio_duration: number;
  file_size: number;
  file_format: string;
  style_type: string;
  is_edited: boolean;
  original_audio_id: number;
}

interface TrashCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCleanupSuccess?: () => void;
}

export function TrashCleanupDialog({
  open,
  onOpenChange,
  onCleanupSuccess,
}: TrashCleanupDialogProps) {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 清理状态
  const [isCleaning, setIsCleaning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [failedFiles, setFailedFiles] = useState<{ audio_url: string; error: string }[]>([]);

  // 批量恢复状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 切换单个选中
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  // 批量恢复
  const handleBatchRestore = async () => {
    setShowRestoreConfirm(false);
    setIsRestoring(true);

    try {
      const result = await audioApi.restoreDeletedTempAudio(Array.from(selectedIds));
      
      // 显示结果
      const failedCount = result.details.filter((d) => d.status === 'failed').length;
      if (failedCount > 0) {
        console.warn(`恢复失败: ${failedCount} 个`);
      }

      // 清除选中状态
      setSelectedIds(new Set());
      
      // 刷新列表
      fetchTrashItems();
      
      // 通知父组件刷新临时音频列表
      onCleanupSuccess?.();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  // 获取垃圾文件列表
  const fetchTrashItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await audioApi.queryDeletedTempAudio({
        page,
        page_size: pageSize,
        file_name: searchKeyword || undefined,
        description: searchKeyword || undefined,
      });
      setItems(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch trash items:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchKeyword]);

  useEffect(() => {
    if (open) {
      fetchTrashItems();
    }
  }, [open, fetchTrashItems]);

  // 搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTrashItems();
  };

  // 清理
  const handleCleanup = async () => {
    setShowConfirmDialog(false);
    setIsCleaning(true);

    try {
      const result = await audioApi.cleanupTempAudio(100);

      if (result.failed_count > 0) {
        // 有失败的文件，显示重试信息
        setFailedFiles(result.failed_details.map((f) => ({ audio_url: f.audio_url, error: f.error })));
      } else {
        // 全部成功
        onOpenChange(false);
        onCleanupSuccess?.();
      }

      // 刷新列表
      fetchTrashItems();
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  // 重试清理
  const handleRetryCleanup = async () => {
    if (failedFiles.length === 0) return;

    setIsRetrying(true);
    try {
      const fileUrls = failedFiles.map((f) => f.audio_url);
      const result = await audioApi.retryCleanupAudio(fileUrls);

      if (result.failed_count > 0) {
        // 仍有失败
        setFailedFiles(
          result.failed_details.map((f) => ({ audio_url: f.file_url, error: f.error }))
        );
      } else {
        // 全部成功
        setFailedFiles([]);
        onOpenChange(false);
        onCleanupSuccess?.();
      }

      // 刷新列表
      fetchTrashItems();
    } catch (error) {
      console.error('Retry cleanup failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // 关闭时重置状态
  const handleClose = () => {
    setItems([]);
    setTotal(0);
    setPage(1);
    setSearchKeyword('');
    setFailedFiles([]);
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              垃圾文件
            </DialogTitle>
            <DialogDescription>
              已删除但尚未清理的临时音频文件，共 {total} 个
            </DialogDescription>
          </DialogHeader>

          {/* 搜索 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="搜索文件名或描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4 mr-1" />
              搜索
            </Button>
          </form>

          {/* 批量操作工具栏 */}
          {items.length > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border mb-3">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
                className="h-4 w-4"
              />
              <span className="text-sm">
                已选择 {selectedIds.size} 项
              </span>
              {selectedIds.size > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => setShowRestoreConfirm(true)}
                  disabled={isRestoring}
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      恢复中...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      批量恢复 ({selectedIds.size})
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* 列表 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">暂无垃圾文件</p>
                <p className="text-sm text-muted-foreground">
                  所有临时音频已清理或保存
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer transition-all',
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                          : 'hover:bg-accent/50'
                      )}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        className="h-5 w-5 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Music className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.file_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDuration(item.audio_duration)}</span>
                          <span>·</span>
                          <span>{item.file_format}</span>
                          <span>·</span>
                          <span>{formatFileSize(item.file_size)}</span>
                          <span>·</span>
                          <span>删除于 {formatRelativeTime(item.deleted_at)}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    第 {page} / {totalPages} 页，共 {total} 条
                  </span>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* 失败信息 */}
          {failedFiles.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">
                清理失败 ({failedFiles.length} 个)
              </p>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {failedFiles.map((file, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    <span className="font-medium">{file.audio_url.split('/').pop()}</span>
                    <span className="ml-2">{file.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              关闭
            </Button>
            {items.length > 0 && (
              failedFiles.length > 0 ? (
                <Button onClick={handleRetryCleanup} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      重试中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      重试清理
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => setShowConfirmDialog(true)} disabled={isCleaning}>
                  {isCleaning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      清理中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      清理
                    </>
                  )}
                </Button>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 清理确认弹窗 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清理</AlertDialogTitle>
            <AlertDialogDescription>
              确定要清理这些垃圾文件吗？清理后文件将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleCleanup}>
              开始清理
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 恢复确认弹窗 */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认恢复</AlertDialogTitle>
            <AlertDialogDescription>
              确定要恢复选中的 {selectedIds.size} 个垃圾文件吗？恢复后文件将回到临时音频列表。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchRestore}>
              恢复
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
