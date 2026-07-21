'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDownload } from '@/hooks/use-download';
import { useConfig } from '@/hooks/use-config';
import { Download, Loader2, Monitor, Apple, Cloud, Link2 } from 'lucide-react';

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: 'windows' | 'mac';
}

export function DownloadDialog({ open, onOpenChange, platform }: DownloadDialogProps) {
  const { download, loading: windowsLoading } = useDownload();
  const { config, loading: configLoading } = useConfig();

  const handleBaiduPanClick = () => {
    if (config?.baiduPanUrl) {
      window.open(config.baiduPanUrl, '_blank');
    }
  };

  const handleQuarkPanClick = () => {
    if (config?.quarkPanUrl) {
      window.open(config.quarkPanUrl, '_blank');
    }
  };

  const hasBaiduPan = config ? !!config.baiduPanUrl : false;
  const hasQuarkPan = config ? !!config.quarkPanUrl : false;

  const isMacComingSoon = platform === 'mac';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center p-6 pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
            {platform === 'windows' ? (
              <Monitor className="h-8 w-8" />
            ) : (
              <Apple className="h-8 w-8" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {platform === 'windows' ? 'Windows 安装包下载' : 'Mac 安装包下载'}
          </DialogTitle>
          <DialogDescription className="text-base mt-2 text-slate-300">
            {isMacComingSoon 
              ? 'Mac 版本正在开发中，敬请期待！' 
              : '请选择下载方式'}
          </DialogDescription>
        </DialogHeader>

        {isMacComingSoon ? (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white">
                <Apple className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="text-base font-semibold text-white">Mac 版本开发中</div>
                <div className="text-sm text-slate-400">我们正在努力开发中，即将上线</div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                确定
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-5 rounded-xl border border-blue-500/30 bg-blue-500/5 px-8 py-7 text-base font-medium text-blue-100 transition hover:bg-blue-500/10"
                onClick={download}
                disabled={windowsLoading}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Download className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-semibold">普通下载</div>
                  <div className="text-xs text-blue-300/70">直接下载安装包</div>
                </div>
                {windowsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                ) : (
                  <Link2 className="h-5 w-5 text-blue-400/70" />
                )}
              </Button>

              {hasBaiduPan && (
                <Button
                  variant="outline"
                  className="w-full gap-5 rounded-xl border border-orange-500/30 bg-orange-500/5 px-8 py-7 text-base font-medium text-orange-100 transition hover:bg-orange-500/10"
                  onClick={handleBaiduPanClick}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-base font-semibold">百度网盘</div>
                    <div className="text-xs text-orange-300/70">高速下载通道</div>
                  </div>
                  <Link2 className="h-5 w-5 text-orange-400/70" />
                </Button>
              )}

              {hasQuarkPan && (
                <Button
                  variant="outline"
                  className="w-full gap-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-8 py-7 text-base font-medium text-yellow-100 transition hover:bg-yellow-500/10"
                  onClick={handleQuarkPanClick}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 shrink-0">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-base font-semibold">夸克网盘</div>
                    <div className="text-xs text-yellow-300/70">极速下载通道</div>
                  </div>
                  <Link2 className="h-5 w-5 text-yellow-400/70" />
                </Button>
              )}

              {!hasBaiduPan && !hasQuarkPan && (
                <div className="px-6 py-3 text-center text-xs text-slate-400 rounded-xl bg-slate-900/30">
                  网盘下载通道即将上线，敬请期待
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}