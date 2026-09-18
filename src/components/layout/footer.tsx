'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ExternalLink, Copy, Video } from 'lucide-react';

// 客户端读取 B 站地址（需 NEXT_PUBLIC_ 前缀）
const BILIBILI_URL = process.env.NEXT_PUBLIC_BILIBILI_URL ?? '';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [bilibiliDialogOpen, setBilibiliDialogOpen] = useState(false);

  /** 复制文本到剪贴板 */
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      toast.success(`${label}已复制`, {
        duration: 2000,
        style: { background: '#10B981', color: 'white' },
      });
    } catch {
      toast.error(`${label}复制失败，请手动选择复制`, {
        duration: 3000,
        style: { background: '#EF4444', color: 'white' },
      });
    }
  };

  /** 点击 B 站超链接：阻止默认跳转，打开确认弹窗 */
  const handleBilibiliClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBilibiliDialogOpen(true);
  };

  /** 确认跳转：在新页签打开 B 站 */
  const handleConfirmRedirect = () => {
    if (!BILIBILI_URL) return;
    window.open(BILIBILI_URL, '_blank', 'noopener,noreferrer');
    setBilibiliDialogOpen(false);
  };

  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-2">关于我们</h4>
              <p className="text-sm text-muted-foreground">
                抽象吧应用致力于为用户提供丰富的桌面应用与辅助工具
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">联系方式</h4>
              <p className="text-sm text-muted-foreground">
                如有问题或建议，请联系我们
              </p>
              {/* B 站超链接 - 仅在配置了 NEXT_PUBLIC_BILIBILI_URL 时显示 */}
              {BILIBILI_URL && (
                <a
                  href={BILIBILI_URL}
                  onClick={handleBilibiliClick}
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-pink-500 hover:text-pink-400 transition-colors font-medium"
                >
                  <Video className="h-3.5 w-3.5" />
                  哔哩哔哩博主视频首页
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">版本信息</h4>
              <p className="text-sm text-muted-foreground">
                当前版本：v1.0.0
              </p>
            </div>
          </div>

          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} 抽象吧应用. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              备用版本：v0.9.9 | 官网备案信息
            </p>
          </div>
        </div>
      </div>

      {/* B 站跳转确认弹窗 */}
      <Dialog open={bilibiliDialogOpen} onOpenChange={setBilibiliDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
          {/* 顶部渐变装饰条 - B 站粉蓝色调 */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-blue-400 to-pink-500" />

          <DialogHeader className="text-center p-5 pb-3">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-blue-500 text-white shadow-lg shadow-pink-500/30">
              <Video className="h-7 w-7" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              即将跳转到哔哩哔哩
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              即将打开新的浏览器页签，前往博主视频首页
            </p>
          </DialogHeader>

          {/* 完整地址展示 */}
          <div className="px-5 flex flex-col gap-3">
            <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-400">完整地址</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-pink-300 hover:bg-pink-500/10 hover:text-pink-200"
                  onClick={() => handleCopy(BILIBILI_URL, 'B站地址')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  复制
                </Button>
              </div>
              <p className="text-xs text-slate-200 break-all leading-relaxed font-mono">
                {BILIBILI_URL || '—'}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 p-5 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50 font-medium"
              onClick={() => setBilibiliDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold shadow-lg shadow-pink-500/25 hover:from-pink-400 hover:to-blue-400 hover:scale-[1.02] transition-all"
              onClick={handleConfirmRedirect}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              确认跳转
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
