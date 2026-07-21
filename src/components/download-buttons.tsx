'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadDialog } from './download-dialog';
import { useDownload } from '@/hooks/use-download';
import { Download, Loader2, Monitor, Apple } from 'lucide-react';

export function DownloadButtons() {
  const { loading: windowsLoading } = useDownload();
  const [isWindowsDialogOpen, setIsWindowsDialogOpen] = useState(false);
  const [isMacDialogOpen, setIsMacDialogOpen] = useState(false);

  const handleWindowsClick = () => {
    setIsWindowsDialogOpen(true);
  };

  const handleMacClick = () => {
    setIsMacDialogOpen(true);
  };

  return (
    <>
      <div className="flex w-full flex-col items-stretch gap-5 py-3">
        <Button
          size="lg"
          className="w-full gap-10 rounded-[1.5rem] border-0 bg-gradient-to-r from-blue-600 to-cyan-500 px-32 py-11 text-base font-semibold text-white shadow-[0_24px_80px_-40px_rgba(56,189,248,0.75)] transition hover:scale-[1.01] hover:shadow-[0_30px_90px_-40px_rgba(56,189,248,0.85)]"
          onClick={handleWindowsClick}
          disabled={windowsLoading}
        >
          {windowsLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              准备下载...
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 text-white shrink-0">
                <Monitor className="h-8 w-8" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-2xl font-semibold">Windows 安装包</div>
                <div className="text-sm text-sky-100/85">稳定版下载</div>
              </div>
              <Download className="h-8 w-8" />
            </>
          )}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full gap-10 rounded-[1.5rem] border-2 border-slate-700 bg-slate-950/80 px-32 py-11 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
          onClick={handleMacClick}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-white shrink-0">
            <Apple className="h-8 w-8" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-2xl font-semibold">Mac 安装包</div>
            <div className="text-sm text-slate-300/85">即将上线</div>
          </div>
          <Download className="h-8 w-8 opacity-40" />
        </Button>
      </div>

      <DownloadDialog
        open={isWindowsDialogOpen}
        onOpenChange={setIsWindowsDialogOpen}
        platform="windows"
      />

      <DownloadDialog
        open={isMacDialogOpen}
        onOpenChange={setIsMacDialogOpen}
        platform="mac"
      />
    </>
  );
}