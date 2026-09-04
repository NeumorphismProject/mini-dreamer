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
import { Loader2, Download, FileArchive, Sparkles } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        {/* 顶部渐变装饰条 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

        <DialogHeader className="text-center p-6 pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <Download className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            下载确认
            <Sparkles className="h-5 w-5 text-pink-400" />
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          {/* 工具信息卡片 */}
          <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-900/50 border border-white/5">
            {/* 文件名 */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20">
                <FileArchive className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-slate-500 mb-1">工具名称</span>
                <span className="text-sm font-semibold text-white truncate">
                  {toolFile.file_name}
                </span>
              </div>
            </div>

            {/* 工具类型 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-slate-500">工具类型</span>
              <span className="text-sm text-purple-400 font-medium px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                {toolFile.tool_type}
              </span>
            </div>

            {/* 更新时间 */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">更新时间</span>
              <span className="text-sm text-slate-300">
                {formatDate(toolFile.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* 捐赠二维码区域 */}
        <div className="px-6 pt-5">
          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-600/8 via-pink-500/8 to-purple-600/8 border border-purple-500/15">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 tracking-wide">
                自愿支持
              </span>
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            </div>
            <img
              src="/wxzf.jpg"
              alt="微信捐赠码"
              className="w-36 h-36 object-cover rounded-xl shadow-md shadow-purple-500/10 border border-white/5"
            />
            <span className="text-xs text-slate-400">微信赞赏</span>
            <div className="text-xs text-slate-400 text-center leading-relaxed space-y-1.5 pt-1">
              <p>
                本站所有工具均为<span className="text-purple-300 font-medium">免费</span>提供，纯系个人业余时间用心为爱发电。
              </p>
              <p>
                若您觉得该工具有帮到您，愿意支持我继续前行，欢迎扫码自愿捐赠一杯奶茶钱~
              </p>
              <p className="text-slate-500 pt-0.5">
                无论捐赠与否，都由衷感谢您的信任与支持！💜
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            下载完成后，双击安装包即可安装使用。若下载链接失效，请重新获取即可。
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
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
