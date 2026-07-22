'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getRoleArchiveUrl, downloadFile } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';

interface RoleDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RoleDownloadDialog({ open, onOpenChange, role }: RoleDownloadDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleGetArchive = async () => {
    if (!role) return;

    setLoading(true);
    try {
      const result = await getRoleArchiveUrl(role.role_archive_key);
      downloadFile(result.download_url);

      toast.success('下载已开始，请查看浏览器下载列表', {
        duration: 2000,
        style: { background: '#10B981', color: 'white' },
      });

      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取下载链接失败';
      toast.error(errorMessage, {
        duration: 3000,
        style: { background: '#F59E0B', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-white">
            支持作者，为他捐赠
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex flex-col items-center gap-4 p-5 rounded-xl bg-slate-900/50 border border-white/5">
            <img
              src="/wxzf.jpg"
              alt="微信支付"
              className="w-40 h-40 object-cover rounded-lg"
            />
            <span className="text-sm text-slate-400">微信平台</span>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              角色免费获取，若您喜欢可自愿捐赠支持作者，由衷感谢您的支持与使用！
            </p>
          </div>
        </div>

        <div className="px-6 pb-3">
          <p className="text-sm text-slate-400 text-center leading-relaxed">
            下载角色压缩包后，在抽象吧桌宠桌面应用中导入即可使用
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400"
            onClick={handleGetArchive}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                获取中
              </>
            ) : (
              <span>
                获取{' '}
                <span className="text-xs opacity-80">(免费)</span>
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}