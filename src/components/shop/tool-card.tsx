'use client';

import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shop/star-rating';
import { Download, File, Settings, ExternalLink, FileText } from 'lucide-react';
import type { ToolFile } from '@/types';

interface ToolCardProps {
  toolFile: ToolFile;
  onDownload: (toolFile: ToolFile) => void;
}

export function ToolCard({ toolFile, onDownload }: ToolCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 p-5">
      {/* 图标 */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20 mb-4">
        <Settings className="h-7 w-7" />
      </div>

      {/* 信息 */}
      <div className="flex flex-1 flex-col">
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 min-h-[3rem]">
          {toolFile.file_name}
        </h3>

        {/* 评分展示（0 分 / 缺失 / 异常均为 5 颗灰星） */}
        <div className="mb-3">
          <StarRating score={toolFile.score} showScore />
        </div>

        {/* 工具描述 */}
        {toolFile.desc && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-purple-400/60" />
              <span className="text-xs text-slate-500">工具描述</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
              {toolFile.desc}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-1">
          <File className="h-3.5 w-3.5 text-slate-500" />
          <p className="text-xs text-slate-400 truncate">
            {toolFile.tool_type}
          </p>
        </div>

        {/* 工具源地址 */}
        {toolFile.link && (
          <a
            href={toolFile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 mb-1 text-xs text-purple-400 hover:text-purple-300 transition-colors truncate"
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">工具源地址</span>
          </a>
        )}

        <p className="text-xs text-slate-500 mb-4">
          更新时间: {formatDate(toolFile.updated_at)}
        </p>

        <Button
          onClick={() => onDownload(toolFile)}
          className="mt-auto w-full gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] hover:from-purple-500 hover:to-pink-400"
        >
          <Download className="h-4 w-4" />
          下载工具
        </Button>
      </div>
    </div>
  );
}