'use client';

import { useState, useEffect, useRef } from 'react';
import type { GenerateResponse } from '@/types';
import { useGenerateStore } from '@/stores';
import { audioApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  SOUND_EFFECT_STYLE_CONFIGS,
  AUDIO_FORMATS,
  DURATION_RANGES,
} from '@/types';
import { Loader2, Wand2, Sparkles, Undo2 } from 'lucide-react';

interface GenerateFormProps {
  defaultType?: 'sound_effect';
  onSuccess?: (result: GenerateResponse) => void;
}

export function GenerateForm({ defaultType = 'sound_effect', onSuccess }: GenerateFormProps) {
  const {
    styleType,
    fileFormat,
    duration,
    status,
    result,
    error,
    editAudio,
    setAudioType,
    setStyleType,
    setFileFormat,
    setDuration,
    setStatus,
    setResult,
    setError,
    reset,
  } = useGenerateStore();

  const [localDescription, setLocalDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // 初始化默认值 - 只执行一次
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (defaultType) {
        setAudioType(defaultType);
      }
    }
  }, [defaultType, setAudioType]);

  // 编辑模式下预填充描述
  useEffect(() => {
    if (editAudio) {
      setLocalDescription(editAudio.description || '');
    }
  }, [editAudio]);

  // 只支持音效
  const styles = SOUND_EFFECT_STYLE_CONFIGS;
  const durationRange = DURATION_RANGES.sound_effect;

  const handleGenerate = async () => {
    if (!localDescription.trim()) {
      setError({ code: 'INVALID_PARAMS', message: '请输入音频描述' });
      return;
    }

    // 立即设置状态，防止重复点击
    setIsGenerating(true);
    setStatus('generating');
    setError(null);
    setOptimizeError(null);

    try {
      const response = await audioApi.generateAudio({
        audio_type: 'sound_effect',
        style_type: styleType || '',
        description: localDescription,
        file_format: fileFormat as 'MP3' | 'WAV' | 'AAC' | 'FLAC' | 'OGG',
        duration,
      });

      setResult(response);
      onSuccess?.(response);
    } catch (error) {
      setError(error as { code: string; message: string });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    reset();
    setLocalDescription('');
    setIsGenerating(false);
    setOriginalPrompt(null);
    setOptimizeError(null);
  };

  const handleQuickSelect = (style: string) => {
    setStyleType(style);
  };

  // 优化提示词
  const handleOptimizePrompt = async () => {
    if (!localDescription.trim() || isOptimizing) return;

    setOptimizeError(null);
    setIsOptimizing(true);

    // 第一次优化时，保存原始输入
    if (originalPrompt === null) {
      setOriginalPrompt(localDescription);
    }

    try {
      // 组装提示词：如果有风格类型，加入前缀
      let promptToSend = localDescription;
      if (styleType) {
        promptToSend = `风格类型是：${styleType}；${localDescription}`;
      }

      const response = await audioApi.optimizePrompt(promptToSend);
      
      // 用优化后的提示词替换输入框内容
      setLocalDescription(response.optimized_prompt);
    } catch (error) {
      const err = error as { code?: string; message?: string };
      setOptimizeError(err.message || '优化失败，请重试');
      // 如果是第一次优化失败，清除保存的原始输入
      if (originalPrompt === null) {
        setOriginalPrompt(null);
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  // 还原原始提示词
  const handleRestorePrompt = () => {
    if (originalPrompt !== null) {
      setLocalDescription(originalPrompt);
      setOriginalPrompt(null);
      setOptimizeError(null);
    }
  };

  // 合并状态：本地状态或 store 状态
  const isDisabled = isGenerating || status === 'generating' || !localDescription.trim();
  const canOptimize = localDescription.trim().length > 0 && !isGenerating && !isOptimizing;
  const showRestore = originalPrompt !== null;

  return (
    <div className="space-y-6">
      {/* 生成中状态提示 - 更明显的等待效果 */}
      {isGenerating && (
        <div className="flex items-center gap-4 p-5 rounded-xl bg-primary/10 border-2 border-primary/30 animate-pulse">
          <div className="relative flex-shrink-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground">正在生成音频，请稍候...</p>
            <p className="text-sm text-muted-foreground mt-1">AI 正在为您创作独特的音频素材</p>
          </div>
        </div>
      )}

      {/* Style Type */}
      <div className="space-y-3">
        <Label>风格类型</Label>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <Button
              key={s.value}
              variant={styleType === s.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickSelect(s.value)}
              className="gap-1"
              disabled={isGenerating}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </Button>
          ))}
        </div>
        {styleType && (
          <p className="text-sm text-muted-foreground">
            {styles.find((s) => s.value === styleType)?.description}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="description">音频描述 *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary"
                  onClick={handleOptimizePrompt}
                  disabled={!canOptimize}
                >
                  {isOptimizing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  优化
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>优化提示词</p>
                <p className="text-xs text-muted-foreground">AI 帮你完善描述，提升生成效果</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {showRestore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary"
                    onClick={handleRestorePrompt}
                    disabled={isOptimizing}
                  >
                    <Undo2 className="h-3 w-3" />
                    还原
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>还原原始描述</p>
                  <p className="text-xs text-muted-foreground">恢复到你最初输入的内容</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Textarea
          id="description"
          placeholder="请详细描述你想要的声音效果... 例如：清脆的玻璃破碎声，适合游戏中的道具破坏效果"
          value={localDescription}
          onChange={(e) => {
            setLocalDescription(e.target.value);
            // 如果用户手动修改了内容，清除优化错误提示
            setOptimizeError(null);
          }}
          rows={4}
          disabled={isGenerating}
          className={optimizeError ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            描述越详细，生成效果越好
          </p>
          {optimizeError && (
            <p className="text-sm text-destructive">
              {optimizeError}
            </p>
          )}
        </div>
      </div>

      {/* File Format */}
      <div className="space-y-3">
        <Label>文件格式</Label>
        <div className="flex flex-wrap gap-2">
          {AUDIO_FORMATS.map((f) => (
            <Button
              key={f.value}
              variant={fileFormat === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFileFormat(f.value)}
              title={f.description}
              disabled={isGenerating}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {AUDIO_FORMATS.find((f) => f.value === fileFormat)?.description}
        </p>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>时长</Label>
          <span className="text-sm font-medium">{duration.toFixed(1)}秒</span>
        </div>
        <Slider
          value={[duration]}
          min={durationRange.min}
          max={durationRange.max}
          step={0.5}
          onValueChange={(v) => setDuration(v[0])}
          disabled={isGenerating}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>最小 {durationRange.min}秒</span>
          <span>最大 {durationRange.max}秒</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
          重置
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isDisabled}
          className="flex-1 gap-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              {editAudio ? '重新生成' : '开始生成'}
            </>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && status === 'success' && (
        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 space-y-2">
          <p className="font-medium text-green-700 dark:text-green-400">
            生成成功！
          </p>
          <p className="text-sm text-muted-foreground">
            音频时长：{result.audio_duration.toFixed(1)}秒 | 格式：{result.file_format} | 大小：{(result.file_size / 1024).toFixed(1)}KB
          </p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="p-4 rounded-lg border bg-destructive/10 space-y-1">
          <p className="font-medium text-destructive">
            生成失败
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || '未知错误，请重试'}
          </p>
        </div>
      )}
    </div>
  );
}
