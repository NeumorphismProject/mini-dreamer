'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeControl } from '@/components/edit/VolumeControl';
import { FadeControl } from '@/components/edit/FadeControl';
import { FormatSelector } from '@/components/edit/FormatSelector';
import { AudioClipEditor } from '@/components/edit/AudioClipEditor';
import { OutputAudioList } from '@/components/edit/OutputAudioList';
import { SaveOutputsDialog } from '@/components/edit/SaveOutputsDialog';
import { AudioSelectDialog } from '@/components/edit/AudioSelectDialog';
import { AudioUploader, type AudioInfo } from '@/components/edit/AudioUploader';
import { useEditStore } from '@/stores/editStore';
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
  FolderOpen,
  Upload
} from 'lucide-react';
import type { AudioFormat } from '@/types/audio';
import { formatDuration } from '@/lib/editUtils';

interface SelectedAudioInfo {
  audio_url: string;
  file_name: string;
  audio_duration?: number;
  file_format?: AudioFormat;
}

export default function AudioEditorPage() {
  const {
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

  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loadedDuration, setLoadedDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'edit' | 'output'>('edit');
  const [uploadedAudio, setUploadedAudio] = useState<AudioInfo | null>(null);

  // 当前选中的音频
  const currentAudio = selectedAudios[0];
  const originalDuration = currentAudio?.audio_duration || loadedDuration;

  // 选择音频后的回调
  const handleAudioSelect = useCallback((audio: SelectedAudioInfo) => {
    reset();
    openDialog([audio]);
    setUploadedAudio(null);
  }, [reset, openDialog]);

  // 上传成功的回调
  const handleUploadComplete = useCallback((audioInfo: AudioInfo) => {
    setUploadedAudio(audioInfo);
    toast.success('上传成功', {
      description: '点击"开始编辑"进入编辑模式',
    });
  }, []);

  // 开始编辑上传的音频
  const handleStartEditUploaded = useCallback(() => {
    if (uploadedAudio) {
      reset();
      openDialog([{
        audio_url: uploadedAudio.audio_url,
        file_name: uploadedAudio.file_name,
        audio_duration: uploadedAudio.audio_duration,
        file_format: uploadedAudio.file_format as AudioFormat,
      }]);
      setUploadedAudio(null);
    }
  }, [uploadedAudio, reset, openDialog]);

  // 应用编辑
  const handleApply = async () => {
    await applyEdit();
  };

  // 保存
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">音频编辑器</h1>
            <p className="text-xs text-muted-foreground">专业音频剪辑与处理工具</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          {/* 选择音频按钮 */}
          <Button
            variant="outline"
            onClick={() => setShowSelectDialog(true)}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            {currentAudio ? '更换音频' : '选择音频'}
          </Button>

          {currentAudio && (
            <>
              <Button
                variant="outline"
                onClick={handleApply}
                disabled={isApplying}
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
                onClick={handleSave}
                disabled={outputAudios.length === 0}
                className="gap-2"
              >
                保存结果
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 主体内容 */}
      {currentAudio ? (
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
            
            {/* Tab 内容区域 */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              {/* 编辑页签内容 */}
              <div className={cn(
                "absolute inset-0 overflow-auto",
                activeTab !== 'edit' && 'invisible'
              )}>
                <div className="p-3 space-y-4">
                  {/* 音频信息 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileAudio className="h-4 w-4" />
                      音频信息
                    </div>
                    <div className="rounded-lg border bg-card p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">文件名</span>
                        <span className="truncate max-w-[160px] font-medium">{currentAudio.file_name}</span>
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

          {/* 右侧时间轴区域 */}
          <div className="flex-1 flex items-center justify-center bg-muted/20 p-6">
            <div className="w-full max-w-4xl">
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
          </div>
        </div>
      ) : (
        /* 空状态 */
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-6">
                <Music className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-semibold mb-2">开始编辑音频</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                选择一个现有音频或上传新文件开始编辑
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 上传区域 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  上传音频文件
                </div>
                {uploadedAudio ? (
                  <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/30">
                    <div className="flex items-start gap-3">
                      <FileAudio className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedAudio.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(uploadedAudio.audio_duration)} · {uploadedAudio.file_format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-3"
                      onClick={handleStartEditUploaded}
                    >
                      开始编辑
                    </Button>
                  </div>
                ) : (
                  <AudioUploader onUploadComplete={handleUploadComplete} />
                )}
              </div>

              {/* 选择现有音频 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  选择现有音频
                </div>
                <button
                  onClick={() => setShowSelectDialog(true)}
                  className="w-full p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors text-center"
                >
                  <FolderOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">从音效库选择</p>
                  <p className="text-xs text-muted-foreground">
                    音效库、精选音效、临时音频
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 音频选择弹窗 */}
      <AudioSelectDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        onSelect={handleAudioSelect}
      />

      {/* 保存弹窗 */}
      <SaveOutputsDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        audios={outputAudios}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
