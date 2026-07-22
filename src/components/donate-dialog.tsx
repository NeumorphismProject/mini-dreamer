'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonateDialog({ open, onOpenChange }: DonateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-white">
            支持开发者
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <p className="text-sm text-slate-300 leading-relaxed text-center mb-5">
            如果您喜欢这款免费应用，并希望它能持续发展、不断优化，欢迎您通过捐赠表达支持。
            无论是否捐赠，我们都由衷感谢您的信任与使用，您的每一份鼓励都是我们前进的动力。
          </p>

          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-slate-900/50 border border-white/5">
            <img
              src="/wxzf.jpg"
              alt="微信支付"
              className="w-40 h-40 object-cover rounded-lg"
            />
            <span className="text-sm text-slate-400">微信平台</span>
          </div>
        </div>

        <div className="flex justify-center p-6 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full max-w-xs rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400"
          >
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}