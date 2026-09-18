'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { getToolFileUrl, downloadFile } from '@/lib/api';
import { toast } from 'sonner';
import {
  Loader2,
  Download,
  Package,
  Sparkles,
  Heart,
  ChevronDown,
  Cloud,
  ExternalLink,
  Copy,
} from 'lucide-react';
import type { ToolFile } from '@/types';

interface ToolDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolFile: ToolFile | null;
}

type RedirectType = 'quark' | 'baidu';

/**
 * 从网盘分享链接中提取验证码（提取码 / 访问码 / 密码）
 * 支持以下常见形态：
 * 1. URL 查询参数：?pwd=xxxx、?password=xxxx、?code=xxxx、?p=xxxx
 * 2. 中文后缀：提取码：xxxx、提取码:xxxx、访问码：xxxx、密码：xxxx
 * 3. 英文后缀：extract code: xxxx、password: xxxx
 */
function extractPassword(url: string): string | null {
  if (!url) return null;
  // 1. URL 查询参数
  const queryMatch = url.match(/[?&](?:pwd|password|code|p)=([^&\s#]+)/i);
  if (queryMatch) return queryMatch[1];
  // 2. 中文/英文后缀
  const tailMatch = url.match(/(?:提取码|访问码|密码|extract\s*code|password)\s*[:：]\s*([A-Za-z0-9]{3,8})/i);
  if (tailMatch) return tailMatch[1];
  return null;
}

export function ToolDownloadDialog({ open, onOpenChange, toolFile }: ToolDownloadDialogProps) {
  const [loading, setLoading] = useState(false);
  // 网盘跳转二次确认弹窗
  const [redirectOpen, setRedirectOpen] = useState(false);
  const [redirectType, setRedirectType] = useState<RedirectType>('quark');

  // 判断是否存在网盘链接（非空字符串）
  const hasQuark = !!toolFile?.quark_link?.trim();
  const hasBaidu = !!toolFile?.baidu_link?.trim();
  const hasNetworkDisk = hasQuark || hasBaidu;

  // 当前要跳转的网盘链接与提取码
  const redirectUrl = redirectType === 'quark' ? (toolFile?.quark_link ?? '') : (toolFile?.baidu_link ?? '');
  const redirectPassword = extractPassword(redirectUrl);

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

  /** 打开网盘跳转二次确认弹窗 */
  const openRedirectDialog = (type: RedirectType) => {
    setRedirectType(type);
    setRedirectOpen(true);
  };

  /** 复制文本到剪贴板，并给出 toast 反馈 */
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

  /** 确认跳转：在新页签打开网盘链接 */
  const handleConfirmRedirect = () => {
    if (!redirectUrl) return;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    setRedirectOpen(false);
    onOpenChange(false);
  };

  if (!toolFile) return null;

  return (
    <>
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
            {/* 工具名称 - 最多两行，超出省略，悬浮显示完整内容 */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20 mt-0.5">
                <Package className="h-4 w-4 text-purple-400" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-semibold text-white line-clamp-2 min-w-0 flex-1 break-words leading-snug cursor-help">
                    {toolFile.file_name}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm break-words">
                  {toolFile.file_name}
                </TooltipContent>
              </Tooltip>
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

            {hasNetworkDisk ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-pink-400 hover:scale-[1.02] transition-all"
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
                        下载
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[calc(100%+1rem)] min-w-[12rem] rounded-xl border-white/10 bg-slate-900/95 backdrop-blur-xl text-slate-200"
                >
                  <DropdownMenuItem
                    className="rounded-lg focus:bg-purple-500/15 focus:text-white cursor-pointer"
                    onSelect={(e) => {
                      // 阻止默认关闭行为，确保先执行下载流程
                      e.preventDefault();
                      handleDownload();
                    }}
                  >
                    <Download className="h-4 w-4 text-purple-400" />
                    <span>普通下载</span>
                  </DropdownMenuItem>

                  {hasQuark && (
                    <DropdownMenuItem
                      className="rounded-lg focus:bg-purple-500/15 focus:text-white cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        openRedirectDialog('quark');
                      }}
                    >
                      <Cloud className="h-4 w-4 text-cyan-400" />
                      <span>夸克网盘</span>
                    </DropdownMenuItem>
                  )}

                  {hasBaidu && (
                    <DropdownMenuItem
                      className="rounded-lg focus:bg-purple-500/15 focus:text-white cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        openRedirectDialog('baidu');
                      }}
                    >
                      <Cloud className="h-4 w-4 text-blue-400" />
                      <span>百度网盘</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 网盘跳转二次确认弹窗 */}
      <Dialog open={redirectOpen} onOpenChange={setRedirectOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

          <DialogHeader className="text-center p-5 pb-3">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/30">
              <ExternalLink className="h-7 w-7" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              即将跳转到{redirectType === 'quark' ? '夸克网盘' : '百度网盘'}
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              即将打开新的浏览器页签，请确认是否继续
            </p>
          </DialogHeader>

          <div className="px-5 flex flex-col gap-3">
            {/* 完整地址 */}
            <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-400">完整地址</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                  onClick={() => handleCopy(redirectUrl, '网盘地址')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  复制
                </Button>
              </div>
              <p className="text-xs text-slate-200 break-all leading-relaxed font-mono">
                {redirectUrl || '—'}
              </p>
            </div>

            {/* 提取码（若存在） */}
            {redirectPassword && (
              <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-400">提取码</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                    onClick={() => handleCopy(redirectPassword, '提取码')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-cyan-200 font-mono tracking-wider font-semibold">
                  {redirectPassword}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-5 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50 font-medium"
              onClick={() => setRedirectOpen(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-cyan-400 hover:to-blue-400 hover:scale-[1.02] transition-all"
              onClick={handleConfirmRedirect}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              确认跳转
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
