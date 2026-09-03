'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadDialog } from './download-dialog';
import { getLatestFile, getLatestCutappFile } from '@/lib/api';
import { Download, Monitor, Apple, Cat, Film } from 'lucide-react';
import type { DownloadResponse } from '@/types';

interface AppState {
  windowsDialogOpen: boolean;
  macDialogOpen: boolean;
  version: string | null;
}

// 应用配置
const apps = [
  {
    key: 'desktopPet' as const,
    name: '抽象版桌宠应用',
    description: '可爱的桌面宠物，陪伴你的每一天',
    icon: Cat,
    gradient: 'from-blue-600 to-cyan-500',
    iconBg: 'from-blue-500 to-cyan-400',
    glow: 'rgba(56,189,248,0.4)',
    getLatestFunc: getLatestFile,
  },
  {
    key: 'cutapp' as const,
    name: '自动剪辑工具',
    description: '智能视频剪辑，一键生成精彩内容',
    icon: Film,
    gradient: 'from-purple-600 to-pink-500',
    iconBg: 'from-purple-500 to-pink-400',
    glow: 'rgba(236,72,153,0.4)',
    getLatestFunc: getLatestCutappFile,
  },
];

export function DownloadButtons() {
  const [states, setStates] = useState<Record<string, AppState>>({
    desktopPet: { windowsDialogOpen: false, macDialogOpen: false, version: null },
    cutapp: { windowsDialogOpen: false, macDialogOpen: false, version: null },
  });

  useEffect(() => {
    apps.forEach((app) => {
      app.getLatestFunc()
        .then((data: DownloadResponse) => {
          if (data?.file_version) {
            setStates((prev) => ({
              ...prev,
              [app.key]: { ...prev[app.key], version: data.file_version },
            }));
          }
        })
        .catch(() => {});
    });
  }, []);

  const updateState = (key: string, patch: Partial<AppState>) => {
    setStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {apps.map((app) => {
        const Icon = app.icon;
        const state = states[app.key];
        const hasWindows = !!app.getLatestFunc;
        const hasMac = false; // Mac 暂未上线

        return (
          <div
            key={app.key}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 transition hover:border-white/20 hover:bg-slate-900/60"
            style={{ boxShadow: `0 20px 60px -30px ${app.glow}` }}
          >
            {/* 顶部图标和标题 */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.iconBg} text-white shadow-lg`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                <p className="text-sm text-slate-400">{app.description}</p>
              </div>
            </div>

            {/* 版本信息 */}
            <div className="mb-4 text-sm text-slate-400">
              {state.version ? (
                <span>最新版本: v{state.version}</span>
              ) : (
                <span className="text-slate-500">获取版本中...</span>
              )}
            </div>

            {/* 下载按钮 */}
            <div className="mt-auto flex flex-col gap-3">
              {hasWindows ? (
                <Button
                  className={`gap-3 rounded-2xl bg-gradient-to-r ${app.gradient} px-6 py-6 text-base font-semibold text-white transition hover:scale-[1.02]`}
                  onClick={() => updateState(app.key, { windowsDialogOpen: true })}
                >
                  <Monitor className="h-6 w-6 shrink-0" />
                  <span className="flex-1 text-left">Windows 安装包</span>
                  <Download className="h-5 w-5 shrink-0" />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-800 bg-slate-950 px-6 py-6 text-base font-semibold text-slate-600">
                  <Monitor className="h-6 w-6" />
                  <span>Windows 暂未上线</span>
                </div>
              )}

              {hasMac ? (
                <Button
                  variant="outline"
                  className="gap-3 rounded-2xl border-2 border-slate-700 bg-slate-950/80 px-6 py-6 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
                  onClick={() => updateState(app.key, { macDialogOpen: true })}
                >
                  <Apple className="h-6 w-6 shrink-0" />
                  <span className="flex-1 text-left">Mac 安装包</span>
                  <Download className="h-5 w-5 shrink-0" />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-800 bg-slate-950 px-6 py-6 text-base font-semibold text-slate-600">
                  <Apple className="h-6 w-6" />
                  <span>Mac 暂未上线</span>
                </div>
              )}
            </div>

            {/* 对话框 */}
            <DownloadDialog
              open={state.windowsDialogOpen}
              onOpenChange={(open) => updateState(app.key, { windowsDialogOpen: open })}
              platform="windows"
              appName={app.name}
              getLatestFileFunc={app.getLatestFunc}
            />
            <DownloadDialog
              open={state.macDialogOpen}
              onOpenChange={(open) => updateState(app.key, { macDialogOpen: open })}
              platform="mac"
              appName={app.name}
            />
          </div>
        );
      })}
    </div>
  );
}