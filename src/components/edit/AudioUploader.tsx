'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileAudio,
  Music,
} from 'lucide-react';

// 支持的音频格式
const ALLOWED_FORMATS = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
const MAX_FILE_SIZE = 90 * 1024 * 1024; // 90MB
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk
const MAX_RETRY = 2; // 最大重试次数
const CONCURRENT_LIMIT = 5; // 并发数

interface ChunkStatus {
  index: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  retryCount: number;
}

interface UploadState {
  file: File | null;
  uploadId: string;
  status: 'idle' | 'uploading' | 'merging' | 'success' | 'error';
  progress: number;
  totalChunks: number;
  uploadedChunks: number;
  chunkStatuses: ChunkStatus[];
  errorMessage: string;
}

interface AudioUploaderProps {
  onUploadComplete: (audioInfo: AudioInfo) => void;
  className?: string;
}

export interface AudioInfo {
  audio_url: string;
  file_name: string;
  audio_duration: number;
  file_format: string;
  file_size: number;
  temp_id: number;
  style_type: string;
  description: string;
  created_at: string;
}

// 生成唯一ID
function generateUploadId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AudioUploader({ onUploadComplete, className }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploadId: '',
    status: 'idle',
    progress: 0,
    totalChunks: 0,
    uploadedChunks: 0,
    chunkStatuses: [],
    errorMessage: '',
  });

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return `文件大小超过限制（最大 ${formatFileSize(MAX_FILE_SIZE)}）`;
    }

    // 检查文件格式
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_FORMATS.includes(ext)) {
      return `不支持的文件格式，仅支持：${ALLOWED_FORMATS.join(', ').toUpperCase()}`;
    }

    return null;
  }, []);

  // 上传单个切片
  const uploadChunk = async (
    chunk: Blob,
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    signal: AbortSignal
  ): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', fileName);

    try {
      const response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
        signal,
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
      return false;
    }
  };

  // 上传切片组（并发）
  const uploadChunkGroup = async (
    chunks: { blob: Blob; index: number }[],
    uploadId: string,
    totalChunks: number,
    fileName: string,
    signal: AbortSignal,
    onProgress: (index: number, success: boolean) => void
  ): Promise<void> => {
    const promises = chunks.map(async ({ blob, index }) => {
      let retryCount = 0;
      let success = false;

      while (retryCount <= MAX_RETRY && !success) {
        success = await uploadChunk(blob, uploadId, index, totalChunks, fileName, signal);
        if (!success && retryCount < MAX_RETRY) {
          retryCount++;
        }
      }

      onProgress(index, success);
      return { index, success };
    });

    await Promise.all(promises);
  };

  // 开始上传
  const startUpload = useCallback(async (file: File) => {
    const uploadId = generateUploadId();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunks: { blob: Blob; index: number }[] = [];

    // 切片
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push({
        blob: file.slice(start, end),
        index: i,
      });
    }

    // 初始化状态
    setUploadState({
      file,
      uploadId,
      status: 'uploading',
      progress: 0,
      totalChunks,
      uploadedChunks: 0,
      chunkStatuses: chunks.map(c => ({
        index: c.index,
        status: 'pending',
        retryCount: 0,
      })),
      errorMessage: '',
    });

    // 创建 AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // 进度回调
    const handleProgress = (index: number, success: boolean) => {
      setUploadState(prev => {
        const newChunkStatuses = prev.chunkStatuses.map(c =>
          c.index === index
            ? { ...c, status: (success ? 'success' : 'error') as ChunkStatus['status'] }
            : c
        );
        const uploadedChunks = newChunkStatuses.filter(c => c.status === 'success').length;
        const progress = Math.round((uploadedChunks / totalChunks) * 100);

        return {
          ...prev,
          chunkStatuses: newChunkStatuses,
          uploadedChunks,
          progress,
        };
      });
    };

    try {
      // 分组并发上传
      for (let i = 0; i < chunks.length; i += CONCURRENT_LIMIT) {
        if (signal.aborted) break;

        const group = chunks.slice(i, i + CONCURRENT_LIMIT);
        await uploadChunkGroup(group, uploadId, totalChunks, file.name, signal, handleProgress);
      }

      // 检查是否有失败的切片
      const currentState = uploadState;
      // 使用 await 等待状态更新
      let failedChunks = 0;
      setUploadState(prev => {
        failedChunks = prev.chunkStatuses.filter(c => c.status === 'error').length;
        return prev;
      });

      // 等待一下让状态更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取最新状态
      const latestState = await new Promise<UploadState>(resolve => {
        setUploadState(prev => {
          const failed = prev.chunkStatuses.filter(c => c.status === 'error').length;
          if (failed > 0) {
            resolve({
              ...prev,
              status: 'error',
              errorMessage: `${failed} 个切片上传失败`,
            });
            return {
              ...prev,
              status: 'error',
              errorMessage: `${failed} 个切片上传失败`,
            };
          }
          resolve(prev);
          return prev;
        });
      });

      if (latestState.status === 'error') {
        return;
      }

      // 合并并上传
      setUploadState(prev => ({ ...prev, status: 'merging' }));

      const mergeResponse = await fetch('/api/merge-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          fileName: file.name,
          totalChunks,
        }),
        signal,
      });

      const mergeResult = await mergeResponse.json();

      if (mergeResult.success) {
        setUploadState(prev => ({
          ...prev,
          status: 'success',
          progress: 100,
        }));
        onUploadComplete(mergeResult.data.audioInfo);
      } else {
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: mergeResult.error || '上传失败',
        }));
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: '上传已取消',
        }));
      } else {
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: (error as Error).message || '上传失败',
        }));
      }
    }
  }, [onUploadComplete, uploadState]);

  // 选择文件
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error,
      }));
      return;
    }

    startUpload(file);
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile, startUpload]);

  // 取消上传
  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setUploadState({
      file: null,
      uploadId: '',
      status: 'idle',
      progress: 0,
      totalChunks: 0,
      uploadedChunks: 0,
      chunkStatuses: [],
      errorMessage: '',
    });
  }, []);

  // 重试上传
  const handleRetry = useCallback(() => {
    if (uploadState.file) {
      startUpload(uploadState.file);
    }
  }, [uploadState.file, startUpload]);

  // 重置
  const handleReset = useCallback(() => {
    setUploadState({
      file: null,
      uploadId: '',
      status: 'idle',
      progress: 0,
      totalChunks: 0,
      uploadedChunks: 0,
      chunkStatuses: [],
      errorMessage: '',
    });
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FORMATS.map(f => `.${f}`).join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 上传区域 */}
      {uploadState.status === 'idle' && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors text-center"
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">点击上传音频文件</p>
          <p className="text-xs text-muted-foreground">
            支持 MP3、WAV、OGG、AAC、FLAC 格式，最大 {formatFileSize(MAX_FILE_SIZE)}
          </p>
        </button>
      )}

      {/* 上传中 */}
      {(uploadState.status === 'uploading' || uploadState.status === 'merging') && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileAudio className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadState.file?.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadState.file?.size || 0)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>
                {uploadState.status === 'merging' 
                  ? '正在处理...' 
                  : `上传中 ${uploadState.uploadedChunks}/${uploadState.totalChunks} 片段`}
              </span>
              <span>{uploadState.progress}%</span>
            </div>
            <Progress value={uploadState.progress} className="h-2" />
          </div>
        </div>
      )}

      {/* 上传成功 */}
      {uploadState.status === 'success' && (
        <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                上传成功
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {uploadState.file?.name}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              继续上传
            </Button>
          </div>
        </div>
      )}

      {/* 上传失败 */}
      {uploadState.status === 'error' && (
        <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-destructive">
                上传失败
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadState.errorMessage}
              </p>
            </div>
            <div className="flex gap-2">
              {uploadState.file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  重试
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
