import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditStore } from '@/stores/editStore';
import { VolumeControl } from './VolumeControl';
import { FadeControl } from './FadeControl';
import { FormatSelector } from './FormatSelector';
import { AudioClipEditor } from './AudioClipEditor';
import { OutputAudioList } from './OutputAudioList';
import { SaveOutputsDialog } from './SaveOutputsDialog';
import { hasUnsavedEdits } from '@/lib/editUtils';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Music, 
  Scissors, 
  Volume2, 
  Waves, 
  FileAudio,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import type { AudioFormat } from '@/types/audio';
import { formatDuration } from '@/lib/editUtils';

interface AudioEditDialogProps {
  selectedAudio?: { audio_url: string; file_name: string; audio_duration?: number; file_format?: AudioFormat };
  /** 确认关闭后的回调（在有未保存内容时确认关闭后触发） */
  onConfirmClose?: () => void;
}

export function AudioEditDialog({ selectedAudio, onConfirmClose }: AudioEditDialogProps) {
  const {
    isOpen,
    selectedAudios,
    volumeMultiplier,
    fadeInMs,
    fadeOutMs,
    clipStartTime,
    clipEndTime,
    outputFormat,
    outputAudios,
    isApplying,
    error,
    openDialog,
    setVolume,
    setFadeIn,
    setFadeOut,
    setClipStart,
    setClipEnd,
    setFormat,
    applyEdit,
    clearOutput,
    reset,
  } = useEditStore();

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loadedDuration, setLoadedDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('edit');

  // 获取当前音频（单音频模式）
  const currentAudio = selectedAudios[0];
  const originalDuration = currentAudio?.audio_duration || loadedDuration;

  // 外部传入的音频打开弹窗
  useEffect(() => {
    if (selectedAudio) {
      openDialog([selectedAudio]);
    }
  }, [selectedAudio, openDialog]);

  const handleClose = () => {
    if (hasUnsavedEdits(outputAudios.length > 0)) {
      setShowConfirmClose(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    reset();
    onConfirmClose?.();
  };

  const handleApply = async () => {
    await applyEdit();
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleSaveSuccess = () => {
    toast.success('保存成功', {
      description: `已将 ${outputAudios.length} 个音频保存到音效库`,
    });
    setShowSaveDialog(false);
    reset();
  };

  const handleDurationLoaded = (duration: number) => {
    setLoadedDuration(duration);
    if (clipEndTime === 0 || clipEndTime === undefined) {
      setClipEnd(duration);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent 
          showCloseButton={false}
          className="!w-[75vw] !min-w-[900px] !max-w-none h-[80vh] max-h-[80vh] p-0 gap-0 flex flex-col"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Music className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">音频编辑器</DialogTitle>
                <DialogDescription className="text-xs">
                  专业音频剪辑与处理工具
                </DialogDescription>
              </div>
            </div>
            
            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              {/* 快速操作按钮 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApply}
                  disabled={isApplying || !currentAudio}
                  className="gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      应用效果
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={outputAudios.length === 0}
                  className="gap-2"
                >
                  保存结果
                </Button>
              </div>
              
              {/* 关闭按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 主体内容 - 左右分栏 */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* 左侧属性面板 */}
            <div className="w-[320px] flex-shrink-0 border-r bg-muted/10 flex flex-col overflow-hidden">
              {/* Tab 头部 */}
              <div className="px-3 pt-3 flex-shrink-0">
                <div className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-muted p-[3px]">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={cn(
                      "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all",
                      activeTab === 'edit'
                        ? "bg-background border-input shadow-sm text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => setActiveTab('output')}
                    className={cn(
                      "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all",
                      activeTab === 'output'
                        ? "bg-background border-input shadow-sm text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    输出 {outputAudios.length > 0 && `(${outputAudios.length})`}
                  </button>
                </div>
              </div>
              
              {/* Tab 内容区域 - 固定高度容器 */}
              <div className="flex-1 min-h-0 overflow-hidden relative">
                {/* 编辑页签内容 */}
                <div className={cn(
                  "absolute inset-0 overflow-auto",
                  activeTab !== 'edit' && 'invisible'
                )}>
                  <div className="p-3 space-y-4">
                      {/* 音频信息 */}
                      {currentAudio && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <FileAudio className="h-4 w-4" />
                            音频信息
                          </div>
                          <div className="rounded-lg border bg-card p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">文件名</span>
                              <span className="truncate max-w-[140px] font-medium">{currentAudio.file_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">时长</span>
                              <span className="font-medium">{formatDuration(originalDuration)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">格式</span>
                              <span className="font-medium uppercase">{currentAudio.file_format || 'MP3'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 剪辑区域 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Scissors className="h-4 w-4" />
                          剪辑区域
                        </div>
                        <div className="rounded-lg border bg-card p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">开始时间</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max={clipEndTime - 0.1}
                                value={clipStartTime.toFixed(1)}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val >= 0 && val < clipEndTime - 0.1) {
                                    setClipStart(val);
                                  }
                                }}
                                className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">结束时间</label>
                              <input
                                type="number"
                                step="0.1"
                                min={clipStartTime + 0.1}
                                max={originalDuration}
                                value={clipEndTime.toFixed(1)}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val > clipStartTime + 0.1 && val <= originalDuration) {
                                    setClipEnd(val);
                                  }
                                }}
                                className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">选中时长</span>
                            <span className="font-medium text-primary">{formatDuration(clipEndTime - clipStartTime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* 音量控制 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Volume2 className="h-4 w-4" />
                          音量调整
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                          <VolumeControl value={volumeMultiplier} onChange={setVolume} />
                        </div>
                      </div>

                      {/* 淡入淡出 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Waves className="h-4 w-4" />
                          淡入淡出
                        </div>
                        <div className="rounded-lg border bg-card p-3 space-y-3">
                          <FadeControl
                            label="淡入"
                            value={fadeInMs}
                            onChange={setFadeIn}
                            maxValue={Math.min(10000, (clipEndTime - clipStartTime) * 500)}
                          />
                          <FadeControl
                            label="淡出"
                            value={fadeOutMs}
                            onChange={setFadeOut}
                            maxValue={Math.min(10000, (clipEndTime - clipStartTime) * 500)}
                          />
                        </div>
                      </div>

                      {/* 输出格式 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <FileAudio className="h-4 w-4" />
                          输出格式
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                          <FormatSelector value={outputFormat} onChange={setFormat} />
                        </div>
                      </div>

                      {/* 错误提示 */}
                      {error && (
                        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
                          {error}
                        </div>
                      )}
                    </div>
                </div>
                
                {/* 输出页签内容 */}
                <div className={cn(
                  "absolute inset-0 overflow-auto",
                  activeTab !== 'output' && 'invisible'
                )}>
                  <div className="p-3 h-full">
                    <OutputAudioList audios={outputAudios} onClear={clearOutput} />
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧时间轴区域 - 波形垂直居中 */}
            <div className="flex-1 flex items-center justify-center bg-muted/20 p-6">
              {currentAudio ? (
                <div className="w-full" style={{ maxWidth: 'calc(75vw - 380px)' }}>
                  <AudioClipEditor
                    audioUrl={currentAudio.audio_url}
                    fileName={currentAudio.file_name}
                    originalDuration={originalDuration}
                    clipStart={clipStartTime}
                    clipEnd={clipEndTime}
                    onClipStartChange={setClipStart}
                    onClipEndChange={setClipEnd}
                    onDurationLoaded={handleDurationLoaded}
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无音频</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 关闭确认弹窗 */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认关闭</AlertDialogTitle>
            <AlertDialogDescription>
              有未保存的编辑结果，确定要关闭吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              确定关闭
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 保存弹窗 */}
      <SaveOutputsDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        audios={outputAudios}
        onSuccess={handleSaveSuccess}
      />
    </>
  );
}
