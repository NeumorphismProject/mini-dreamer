'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadDialog } from './download-dialog';
import { getLatestFile, getLatestCutappFile } from '@/lib/api';
import { Download, Loader2, Monitor, Apple } from 'lucide-react';
import type { DownloadResponse } from '@/types';

interface AppState {
  windowsDialogOpen: boolean;
  macDialogOpen: boolean;
  version: string | null;
}

export function DownloadButtons() {
  const [desktopPet, setDesktopPet] = useState<AppState>({
    windowsDialogOpen: false,
    macDialogOpen: false,
    version: null,
  });

  const [cutapp, setCutapp] = useState<AppState>({
    windowsDialogOpen: false,
    macDialogOpen: false,
    version: null,
  });

  useEffect(() => {
    // 获取桌宠应用版本
    getLatestFile()
      .then((data: DownloadResponse) => {
        if (data?.file_version) {
          setDesktopPet(prev => ({ ...prev, version: data.file_version }));
        }
      })
      .catch(() => {
        // 静默失败，不显示版本
      });

    // 获取自动剪辑工具版本
    getLatestCutappFile()
      .then((data: DownloadResponse) => {
        if (data?.file_version) {
          setCutapp(prev => ({ ...prev, version: data.file_version }));
        }
      })
      .catch(() => {
        // 静默失败，不显示版本
      });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* 抽象版桌宠应用 */}
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">抽象版桌宠应用</h3>
          <p className="text-sm text-slate-400">可爱的桌面宠物，陪伴你的每一天</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full gap-10 rounded-[1.5rem] border-0 bg-gradient-to-r from-blue-600 to-cyan-500 px-32 py-11 text-base font-semibold text-white shadow-[0_24px_80px_-40px_rgba(56,189,248,0.75)] transition hover:scale-[1.01] hover:shadow-[0_30px_90px_-40px_rgba(56,189,248,0.85)]"
            onClick={() => setDesktopPet(prev => ({ ...prev, windowsDialogOpen: true }))}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 text-white shrink-0">
              <Monitor className="h-8 w-8" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-2xl font-semibold">Windows 安装包</div>
              <div className="text-sm text-sky-100/85">
                稳定版下载
                {desktopPet.version && <span className="ml-2">(最新版本: v{desktopPet.version})</span>}
              </div>
            </div>
            <Download className="h-8 w-8" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-10 rounded-[1.5rem] border-2 border-slate-700 bg-slate-950/80 px-32 py-11 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
            onClick={() => setDesktopPet(prev => ({ ...prev, macDialogOpen: true }))}
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
      </div>

      {/* 自动剪辑工具 */}
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">自动剪辑工具</h3>
          <p className="text-sm text-slate-400">智能视频剪辑，一键生成精彩内容</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full gap-10 rounded-[1.5rem] border-0 bg-gradient-to-r from-purple-600 to-pink-500 px-32 py-11 text-base font-semibold text-white shadow-[0_24px_80px_-40px_rgba(236,72,153,0.75)] transition hover:scale-[1.01] hover:shadow-[0_30px_90px_-40px_rgba(236,72,153,0.85)]"
            onClick={() => setCutapp(prev => ({ ...prev, windowsDialogOpen: true }))}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 text-white shrink-0">
              <Monitor className="h-8 w-8" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-2xl font-semibold">Windows 安装包</div>
              <div className="text-sm text-purple-100/85">
                稳定版下载
                {cutapp.version && <span className="ml-2">(最新版本: v{cutapp.version})</span>}
              </div>
            </div>
            <Download className="h-8 w-8" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-10 rounded-[1.5rem] border-2 border-slate-700 bg-slate-950/80 px-32 py-11 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
            onClick={() => setCutapp(prev => ({ ...prev, macDialogOpen: true }))}
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
      </div>

      {/* 对话框 */}
      <DownloadDialog
        open={desktopPet.windowsDialogOpen}
        onOpenChange={(open) => setDesktopPet(prev => ({ ...prev, windowsDialogOpen: open }))}
        platform="windows"
        appName="抽象版桌宠应用"
        getLatestFileFunc={getLatestFile}
      />

      <DownloadDialog
        open={desktopPet.macDialogOpen}
        onOpenChange={(open) => setDesktopPet(prev => ({ ...prev, macDialogOpen: open }))}
        platform="mac"
        appName="抽象版桌宠应用"
      />

      <DownloadDialog
        open={cutapp.windowsDialogOpen}
        onOpenChange={(open) => setCutapp(prev => ({ ...prev, windowsDialogOpen: open }))}
        platform="windows"
        appName="自动剪辑工具"
        getLatestFileFunc={getLatestCutappFile}
      />

      <DownloadDialog
        open={cutapp.macDialogOpen}
        onOpenChange={(open) => setCutapp(prev => ({ ...prev, macDialogOpen: open }))}
        platform="mac"
        appName="自动剪辑工具"
      />
    </div>
  );
}