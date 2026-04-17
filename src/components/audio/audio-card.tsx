'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { AudioItem, TagItem } from '@/types';
import { usePlayerStore } from '@/stores';
import { useEditStore } from '@/stores/editStore';
import {
  formatDuration,
  formatFileSize,
  formatRelativeTime,
  getAudioCategoryLabel,
  getAudioCategoryStyle,
} from '@/lib/utils';
import { downloadAudio } from '@/lib/utils';
import { looksLikeJson } from '@/lib/jsonUtils';
import { audioApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { JsonDetailDrawer } from '@/components/common/JsonDetailDrawer';
import { TagSelector } from '@/components/tag';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Play,
  Pause,
  Download,
  Save,
  Trash2,
  MoreVertical,
  Edit,
  FileJson,
  ArrowRightToLine,
  ArrowLeftFromLine,
  Loader2,
  Star,
  Tags,
  Video,
  Image as ImageIcon,
  ZoomIn,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// 空图片 SVG 图标
const EmptyImageIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

interface AudioCardProps {
  audio: AudioItem;
  showSave?: boolean;
  saveButtonLabel?: string; // 自定义保存按钮文本
  showDelete?: boolean;
  showEdit?: boolean;
  showJsonView?: boolean;
  showMoveToTemp?: boolean;
  showMoveToPremium?: boolean;
  showRestoreFromPremium?: boolean;
  showCheckbox?: boolean;
  showAddTags?: boolean;
  showViewVideo?: boolean;  // 音效库/精品库：查看视频
  showViewMedia?: boolean;  // 临时音频：查看图片和视频
  isSelected?: boolean;
  isMoving?: boolean;
  onSave?: (audio: AudioItem) => void;
  onDelete?: (audio: AudioItem) => void;
  onEdit?: (audio: AudioItem) => void;
  onSelect?: (audio: AudioItem) => void;
  onMoveToTemp?: (audio: AudioItem) => void;
  onMoveToPremium?: (audio: AudioItem) => void;
  onRestoreFromPremium?: (audio: AudioItem) => void;
  onAddTags?: (audio: AudioItem, tags: TagItem[]) => void;
  variant?: 'default' | 'compact';
}

export function AudioCard({
  audio,
  showSave = false,
  saveButtonLabel = '保存',
  showDelete = false,
  showEdit = false,
  showJsonView = false,
  showMoveToTemp = false,
  showMoveToPremium = false,
  showRestoreFromPremium = false,
  showCheckbox = false,
  showAddTags = false,
  showViewVideo = false,
  showViewMedia = false,
  isSelected = false,
  isMoving = false,
  onSave,
  onDelete,
  onEdit,
  onSelect,
  onMoveToTemp,
  onMoveToPremium,
  onRestoreFromPremium,
  onAddTags,
  variant = 'default',
}: AudioCardProps) {
  const { currentAudio, isPlaying, setCurrentAudio, setIsPlaying } = usePlayerStore();
  const { openDialog } = useEditStore();
  const [isLoading, setIsLoading] = useState(false);
  const [jsonDrawerOpen, setJsonDrawerOpen] = useState(false);
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>(audio.tags || []);

  // 图片预览状态
  const [previewImageOpen, setPreviewImageOpen] = useState(false);

  // 视频预览状态
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // 图片和视频抽屉状态（临时音频）
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [mediaSheetImage, setMediaSheetImage] = useState<string | null>(null);
  const [mediaSheetVideo, setMediaSheetVideo] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const isCurrentAudio = currentAudio?.audio_url === audio.audio_url;
  const isCurrentlyPlaying = isCurrentAudio && isPlaying;
  const isJsonDescription = showJsonView && audio.description && looksLikeJson(audio.description);

  // 判断是否有图片
  const hasSourceImage = audio.source_image_url && audio.source_image_url.trim() !== '';

  const handlePlay = async () => {
    if (isCurrentAudio) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadAudio(audio.audio_url, audio.file_name);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave?.(audio);
  };

  const handleDelete = () => {
    onDelete?.(audio);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(audio);
    } else {
      openDialog([{
        audio_url: audio.audio_url,
        file_name: audio.file_name,
        audio_duration: audio.audio_duration,
        file_format: audio.file_format,
      }]);
    }
  };

  const handleSelect = () => {
    onSelect?.(audio);
  };

  const handleMoveToTemp = () => {
    onMoveToTemp?.(audio);
  };

  const handleMoveToPremium = () => {
    onMoveToPremium?.(audio);
  };

  const handleRestoreFromPremium = () => {
    onRestoreFromPremium?.(audio);
  };

  const handleAddTags = () => {
    onAddTags?.(audio, selectedTags);
    setTagSelectorOpen(false);
  };

  // 查看视频（音效库/精品库）
  const handleViewVideo = async () => {
    if (!audio.file_name) return;
    setLoadingVideo(true);
    setVideoDialogOpen(true);
    try {
      const result = await audioApi.queryAudioSourceVideo(audio.file_name);
      setVideoUrl(result.source_video?.media_url || null);
    } catch (error) {
      console.error('Failed to fetch video:', error);
      setVideoUrl(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  // 查看图片和视频（临时音频）
  const handleViewMedia = async () => {
    if (!audio.file_name) return;
    setLoadingMedia(true);
    setMediaSheetOpen(true);
    setMediaSheetImage(null);
    setMediaSheetVideo(null);
    try {
      const [imageResult, videoResult] = await Promise.all([
        audioApi.queryAudioSourceImage(audio.file_name),
        audioApi.queryAudioSourceVideo(audio.file_name),
      ]);
      setMediaSheetImage(imageResult.source_image?.media_url || null);
      setMediaSheetVideo(videoResult.source_video?.media_url || null);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer',
          isCurrentAudio && 'border-primary bg-primary/5',
          isSelected && 'border-primary bg-primary/10'
        )}
        onClick={handlePlay}
      >
        {/* Checkbox for batch selection */}
        {showCheckbox && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              className="h-4 w-4"
            />
          </div>
        )}

        {/* Play button */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0"
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">
            {audio.audio_name || audio.file_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDuration(audio.audio_duration)}</span>
            <span>·</span>
            <span>{audio.file_format}</span>
            <span>·</span>
            <span>{audio.style_type}</span>
          </div>
        </div>

        {/* Duration */}
        <span className="text-xs text-muted-foreground shrink-0">
          {formatRelativeTime(audio.created_at)}
        </span>

        {/* Quick actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          {showEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {showSave && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          )}
          {showDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {showAddTags && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTagSelectorOpen(true)}>
              <Tags className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg border bg-card transition-all card-hover',
          isCurrentAudio && 'border-primary bg-primary/5',
          isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : '',
          showCheckbox && 'cursor-pointer'
        )}
        onClick={() => showCheckbox && handleSelect()}
      >
        {/* 缩略图区域 */}
        <div 
          className={cn(
            'relative aspect-[4/3] bg-muted/30 overflow-hidden',
            hasSourceImage && 'cursor-pointer group/img'
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (hasSourceImage) {
              setPreviewImageOpen(true);
            }
          }}
        >
          {hasSourceImage ? (
            <>
              <Image
                src={audio.source_image_url!}
                alt="音频封面"
                fill
                unoptimized
                className="object-cover transition-transform group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <EmptyImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Checkbox for batch selection */}
          {showCheckbox && (
            <div 
              className="absolute top-3 left-3 z-10 bg-background/80 rounded p-1" 
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelect}
                className="h-5 w-5 border-2"
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium shrink-0',
                    getAudioCategoryStyle(audio.file_name)
                  )}
                >
                  {getAudioCategoryLabel(audio.file_name)}
                </Badge>
                <h3 className="truncate font-medium text-sm">
                  {audio.audio_name || audio.file_name}
                </h3>
              </div>
              {isJsonDescription ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setJsonDrawerOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1 w-fit"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  <span>点击查看编辑参数</span>
                </button>
              ) : (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {audio.description}
                </p>
              )}
            </div>
            {audio.style_type && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {audio.style_type}
              </Badge>
            )}
          </div>

          {/* Waveform placeholder */}
          <div className="h-12 bg-muted/50 rounded-md mb-3 flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            >
              {isCurrentlyPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{formatDuration(audio.audio_duration)}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{audio.file_format}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{formatFileSize(audio.file_size)}</span>
          </div>

          {/* Tags */}
          {audio.tags && audio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {audio.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {tag.tag_name}
                </Badge>
              ))}
            </div>
          )}

          {/* View video link */}
          {showViewVideo && (
            <button
              className="flex items-center gap-1 text-xs text-primary hover:underline mb-3"
              onClick={(e) => { e.stopPropagation(); handleViewVideo(); }}
            >
              <Video className="h-3 w-3" />
              查看视频
            </button>
          )}

          {/* View media link */}
          {showViewMedia && (
            <button
              className="flex items-center gap-1 text-xs text-primary hover:underline mb-3"
              onClick={(e) => { e.stopPropagation(); handleViewMedia(); }}
            >
              <ImageIcon className="h-3 w-3" />
              查看图片和视频
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 min-w-0"
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                disabled={isLoading}
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">下载</span>
              </Button>

              {showSave && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 min-w-0"
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                >
                  <Save className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{saveButtonLabel}</span>
                </Button>
              )}
            </div>

            {/* 在选择模式下隐藏更多操作菜单 */}
            {!showCheckbox && (showDelete || showEdit || showMoveToTemp || showMoveToPremium || showRestoreFromPremium || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" disabled={isMoving}>
                    {isMoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {showEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                  )}
                  {showMoveToTemp && onMoveToTemp && (
                    <DropdownMenuItem onClick={handleMoveToTemp} disabled={isMoving}>
                      {isMoving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          移除中...
                        </>
                      ) : (
                        <>
                          <ArrowRightToLine className="h-4 w-4 mr-2" />
                          移除到临时表
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {showMoveToPremium && onMoveToPremium && (
                    <DropdownMenuItem onClick={handleMoveToPremium} disabled={isMoving}>
                      {isMoving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          添加中...
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          转为精选
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {showRestoreFromPremium && onRestoreFromPremium && (
                    <DropdownMenuItem onClick={handleRestoreFromPremium} disabled={isMoving}>
                      {isMoving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          移出中...
                        </>
                      ) : (
                        <>
                          <ArrowLeftFromLine className="h-4 w-4 mr-2" />
                          移出精品库
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {showDelete && onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  )}
                  {showAddTags && onAddTags && (
                    <DropdownMenuItem
                      onClick={() => setTagSelectorOpen(true)}
                    >
                      <Tags className="h-4 w-4 mr-2" />
                      添加标签
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="absolute top-2 right-2 text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
          {formatRelativeTime(audio.created_at)}
        </div>
      </div>

      {/* 图片预览弹窗 */}
      <Dialog open={previewImageOpen} onOpenChange={setPreviewImageOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>图片预览</DialogTitle>
          </DialogHeader>
          {hasSourceImage && (
            <div className="relative w-full h-auto max-h-[90vh] min-h-[300px]">
              <Image
                src={audio.source_image_url!}
                alt="预览图片"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/10"
            onClick={() => setPreviewImageOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogContent>
      </Dialog>

      {/* 视频预览弹窗 */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>视频预览</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {loadingVideo ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                暂无关联视频
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片和视频抽屉（临时音频） */}
      <Sheet open={mediaSheetOpen} onOpenChange={setMediaSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>图片和视频</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {loadingMedia ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* 图片区域 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    源图片
                  </h4>
                  <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden relative">
                    {mediaSheetImage ? (
                      <Image
                        src={mediaSheetImage}
                        alt="源图片"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <EmptyImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">暂无图片</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 视频区域 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    源视频
                  </h4>
                  <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                    {mediaSheetVideo ? (
                      <video
                        src={mediaSheetVideo}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Video className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">暂无视频</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* JSON Detail Drawer */}
      {isJsonDescription && audio.description && (
        <JsonDetailDrawer
          open={jsonDrawerOpen}
          onClose={() => setJsonDrawerOpen(false)}
          title={`${audio.audio_name || audio.file_name} - 编辑参数`}
          jsonString={audio.description}
        />
      )}

      {/* Tag Selector Dialog */}
      {showAddTags && onAddTags && (
        <AlertDialog open={tagSelectorOpen} onOpenChange={setTagSelectorOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>为「{audio.audio_name || audio.file_name}」添加标签</AlertDialogTitle>
              <AlertDialogDescription>
                选择最多 3 个标签来分类这个音频
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
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
                initialTags={audio.tags}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTagSelectorOpen(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddTags}>保存标签</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
