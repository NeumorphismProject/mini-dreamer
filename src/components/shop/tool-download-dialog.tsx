'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getToolFileUrl, downloadFile } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Download, Package, Sparkles, Heart } from 'lucide-react';
import type { ToolFile } from '@/types';

interface ToolDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolFile: ToolFile | null;
}

export function ToolDownloadDialog({ open, onOpenChange, toolFile }: ToolDownloadDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!toolFile) return;

    setLoading(true);
    try {
      const result = await getToolFileUrl(toolFile.storage_key);
      downloadFile(result.download_url);

      toast.success('下载已开始，请查看浏览器下载列表', {
        duration: 2000,
        style: { background: '#10B981', color: 'white' },
      });

      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取下载链接失败';
      toast.error(errorMessage, {
        duration: 10000,
        style: { background: '#EF4444', color: 'white' },
        description: '点击右侧按钮可复制错误信息',
        action: {
          label: '复制',
          onClick: () => {
            navigator.clipboard?.writeText(errorMessage);
            toast.success('错误信息已复制', { duration: 2000, style: { background: '#10B981', color: 'white' } });
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!toolFile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        {/* 顶部渐变装饰条 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

        <DialogHeader className="text-center p-5 pb-3">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <Download className="h-7 w-7" />
          </div>
          <DialogTitle className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            下载确认
            <Sparkles className="h-4 w-4 text-pink-400" />
          </DialogTitle>
        </DialogHeader>

        <div className="px-5">
          {/* 工具名称 - 简化只保留一行 */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20">
              <Package className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-white truncate min-w-0 flex-1">
              {toolFile.file_name}
            </span>
          </div>
        </div>

        {/* 捐赠二维码区域 - 文案简化为一行 */}
        <div className="px-5 pt-4">
          <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br from-purple-600/8 via-pink-500/8 to-purple-600/8 border border-purple-500/15">
            <img
              src="/wxzf.jpg"
              alt="微信捐赠码"
              className="w-32 h-32 object-cover rounded-xl shadow-md shadow-purple-500/10 border border-white/5"
            />
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              <span className="text-purple-300 font-medium">免费</span>工具 · 自愿捐赠 · 由衷感谢
              <Heart className="inline h-3 w-3 ml-0.5 text-pink-400 align-[-2px]" />
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50 font-medium"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-pink-400 hover:scale-[1.02] transition-all"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                获取链接中
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                确认下载
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
