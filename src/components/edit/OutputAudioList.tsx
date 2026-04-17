'use client';

import { OutputAudio } from '@/stores/editStore';
import { Button } from '@/components/ui/button';
import { downloadAudio, formatFileSize } from '@/lib/editUtils';
import { AudioWaveformPlayer } from './AudioWaveformPlayer';
import { Trash2, Download } from 'lucide-react';

interface OutputAudioListProps {
  audios: OutputAudio[];
  onClear: () => void;
}

export function OutputAudioList({ audios, onClear }: OutputAudioListProps) {
  // 空状态
  if (audios.length === 0) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">输出音频列表</label>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 py-12 px-4">
          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            点击下方「应用」按钮生成编辑后的音频
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = async (audio: OutputAudio) => {
    try {
      await downloadAudio(audio.audio_url, audio.file_name);
    } catch {
      console.error('下载失败');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          输出音频列表 ({audios.length})
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs h-7 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          清空结果
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {audios.map((audio) => {
          const audioKey = `${audio.audio_url}-${audio.file_name}`;

          return (
            <div
              key={audioKey}
              className="rounded-lg border bg-card text-card-foreground p-4 space-y-3"
            >
              {/* 波形播放器 */}
              <AudioWaveformPlayer
                audioUrl={audio.audio_url}
                fileName={audio.file_name}
                duration={audio.audio_duration}
                showLoopToggle
              />

              {/* 编辑参数信息 */}
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                {audio.edit_params.volume_multiplier !== 1.0 && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">音量 {audio.edit_params.volume_multiplier}x</span>
                )}
                {audio.edit_params.fade_in_ms > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">淡入 {audio.edit_params.fade_in_ms}ms</span>
                )}
                {audio.edit_params.fade_out_ms > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">淡出 {audio.edit_params.fade_out_ms}ms</span>
                )}
                {(audio.edit_params.clip_start_time !== undefined && audio.edit_params.clip_start_time > 0) && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">
                    剪辑 {audio.edit_params.clip_start_time}s - {audio.edit_params.clip_end_time}s
                  </span>
                )}
              </div>

              {/* 文件信息 */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-3">
                  <span>格式: {audio.file_format}</span>
                  <span>大小: {formatFileSize(audio.file_size)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(audio)}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
