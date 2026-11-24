'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExternalLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
  description?: string;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('copy failed');
}

export function ExternalLinkDialog({
  open,
  onOpenChange,
  url,
  title = '工具使用教学',
  description = '即将打开外部网站，请确认是否继续跳转',
}: ExternalLinkDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(url);
      setCopied(true);
      toast.success('链接地址已复制', {
        duration: 2000,
        style: { background: '#10B981', color: 'white' },
      });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动选择链接地址', {
        duration: 3000,
        style: { background: '#EF4444', color: 'white' },
      });
    }
  };

  const handleConfirm = () => {
    const urlText = url.trim();
    if (!urlText) return;

    try {
      const parsedUrl = new URL(urlText);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('unsupported protocol');
      }
      window.open(parsedUrl.toString(), '_blank', 'noopener,noreferrer');
      onOpenChange(false);
    } catch {
      toast.error('链接地址无效，无法跳转', {
        duration: 3000,
        style: { background: '#EF4444', color: 'white' },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

        <DialogHeader className="p-5 pb-3 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <ExternalLink className="h-7 w-7" />
          </div>
          <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>
          <p className="mt-1 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
            {description}
          </p>
        </DialogHeader>

        <div className="px-5">
          <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <p className="line-clamp-2 min-w-0 flex-1 break-all font-mono text-xs leading-5 text-slate-200" title={url}>
              {url || '—'}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 rounded-lg text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
              aria-label="复制教学链接"
              onClick={handleCopy}
              disabled={!url}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl border-white/10 bg-transparent font-medium text-slate-300 hover:bg-slate-800/50"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 font-semibold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] hover:from-purple-500 hover:to-pink-400"
            onClick={handleConfirm}
            disabled={!url.trim()}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            确认跳转
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
