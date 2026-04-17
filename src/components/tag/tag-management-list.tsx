'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TagItem } from '@/types';
import { tagApi } from '@/services/api';
import type { ExtendedErrorInfo } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { TagEditDialog } from './tag-edit-dialog';
import { formatRelativeTime } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TagManagementListProps {
  showDeleted?: boolean;
}

export function TagManagementList({ showDeleted = false }: TagManagementListProps) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 编辑弹窗
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);

  // 删除确认弹窗
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteTags, setPendingDeleteTags] = useState<TagItem[]>([]);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  // 批量操作中
  const [isOperating, setIsOperating] = useState(false);

  // 防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchName]);

  // 加载标签
  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = showDeleted
        ? await tagApi.queryDeletedTags({
            page,
            page_size: pageSize,
            tag_name: debouncedSearch || undefined,
          })
        : await tagApi.queryTags({
            page,
            page_size: pageSize,
            tag_name: debouncedSearch || undefined,
          });

      setTags(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load tags:', error);
      const err = error as ExtendedErrorInfo;
      toast.error(err.message || '加载标签失败');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, showDeleted]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // 刷新
  const handleRefresh = () => {
    loadTags();
    setSelectedIds(new Set());
  };

  // 搜索
  const handleSearch = () => {
    setDebouncedSearch(searchName);
    setPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchName('');
    setDebouncedSearch('');
    setPage(1);
  };

  // 选择/取消选择
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选
  const toggleSelectAll = () => {
    if (selectedIds.size === tags.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tags.map((t) => t.id)));
    }
  };

  // 取消选择
  const cancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // 批量删除 - 打开确认弹窗
  const openBatchDeleteConfirm = () => {
    if (selectedIds.size === 0) return;
    const tagsToDelete = tags.filter((t) => selectedIds.has(t.id));
    setPendingDeleteTags(tagsToDelete);
    setIsBatchDelete(true);
    setDeleteConfirmOpen(true);
  };

  // 单个删除 - 打开确认弹窗
  const openDeleteConfirm = (tag: TagItem) => {
    setPendingDeleteTags([tag]);
    setIsBatchDelete(false);
    setDeleteConfirmOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (pendingDeleteTags.length === 0) return;

    setIsOperating(true);
    setDeleteConfirmOpen(false);

    try {
      const ids = pendingDeleteTags.map((t) => t.id);
      const result = await tagApi.softDeleteTags(ids);

      if (result.success) {
        toast.success(`成功删除 ${result.deleted_count} 个标签`);
      } else {
        // 部分失败或全部失败的情况
        const successCount = result.deleted_count || 0;
        const failedCount = result.failed_count || 0;

        // 获取失败的详情（兼容有无 status 字段的情况）
        const failedDetails = result.details.filter(
          (d) => d.status === 'failed' || (d as { error?: string }).error
        );
        const errorMessages = failedDetails
          .map((d) => d.error || '未知错误')
          .join('；');

        if (successCount > 0 && failedCount > 0) {
          // 部分成功
          toast.warning(`部分删除成功：成功 ${successCount} 个，失败 ${failedCount} 个`, {
            description: errorMessages || result.message,
          });
        } else if (failedCount > 0) {
          // 全部失败
          toast.error('删除失败', {
            description: errorMessages || result.message,
          });
        }
      }

      setSelectedIds(new Set());
      setIsSelectionMode(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to delete tags:', error);
      const err = error as ExtendedErrorInfo;
      const message = err.message || '删除失败，请重试';
      // 如果有 details 中的错误信息，作为 description 显示
      if (err.errorMessage) {
        toast.error(message, { description: err.errorMessage });
      } else {
        toast.error(message);
      }
    } finally {
      setIsOperating(false);
      setPendingDeleteTags([]);
    }
  };

  // 批量恢复
  const handleBatchRestore = async () => {
    if (selectedIds.size === 0) return;

    setIsOperating(true);
    try {
      const result = await tagApi.restoreTags(Array.from(selectedIds));

      if (result.success) {
        toast.success(`成功恢复 ${result.restored_count} 个标签`);
      } else {
        const failedDetails = result.details.filter((d) => d.status === 'failed');
        toast.warning(result.message, {
          description: failedDetails.map((d) => d.error).join('；'),
        });
      }

      setSelectedIds(new Set());
      setIsSelectionMode(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to restore tags:', error);
      const err = error as ExtendedErrorInfo;
      if (err.errorMessage) {
        toast.error(err.message || '恢复失败', { description: err.errorMessage });
      } else {
        toast.error(err.message || '恢复失败');
      }
    } finally {
      setIsOperating(false);
    }
  };

  // 编辑
  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setEditDialogOpen(true);
  };

  // 新建
  const handleCreate = () => {
    setEditingTag(null);
    setEditDialogOpen(true);
  };

  // 计算分页
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* 搜索和操作栏 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标签名称..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            搜索
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            重置
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                已选择 {selectedIds.size} 项
              </span>
              {showDeleted ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBatchRestore}
                  disabled={selectedIds.size === 0 || isOperating}
                >
                  {isOperating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <RotateCcw className="h-4 w-4 mr-2" />
                  批量恢复
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={openBatchDeleteConfirm}
                  disabled={selectedIds.size === 0 || isOperating}
                >
                  {isOperating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={cancelSelection}>
                取消
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                disabled={tags.length === 0}
              >
                <Checkbox className="h-4 w-4 mr-2" />
                批量选择
              </Button>
              {!showDeleted && (
                <Button size="sm" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建标签
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionMode && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === tags.length && tags.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="w-[200px]">标签名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[180px]">
                {showDeleted ? '删除时间' : '创建时间'}
              </TableHead>
              {!showDeleted && <TableHead className="w-[120px]">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isSelectionMode ? 5 : 5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSelectionMode ? 5 : 5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {showDeleted ? '暂无已删除的标签' : '暂无标签'}
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  {isSelectionMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(tag.id)}
                        onCheckedChange={() => toggleSelect(tag.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <Badge variant="secondary">{tag.tag_name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.description || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {showDeleted && tag.deleted_at
                      ? formatRelativeTime(tag.deleted_at)
                      : formatRelativeTime(tag.created_at)}
                  </TableCell>
                  {!showDeleted && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tag)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteConfirm(tag)}
                          disabled={isOperating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* 编辑/创建弹窗 */}
      <TagEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tag={editingTag}
        onSuccess={handleRefresh}
      />

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {isBatchDelete ? (
                <>
                  确定要删除选中的 {pendingDeleteTags.length} 个标签吗？
                  <br />
                  <span className="text-muted-foreground text-xs">
                    只能删除没有音频关联的标签
                  </span>
                </>
              ) : (
                <>
                  确定要删除标签「{pendingDeleteTags[0]?.tag_name}」吗？
                  <br />
                  <span className="text-muted-foreground text-xs">
                    只能删除没有音频关联的标签
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isOperating}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isOperating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isOperating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
