'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Role } from '@/types';

interface RoleCardProps {
  role: Role;
  onDownload: (role: Role) => void;
}

export function RoleCard({ role, onDownload }: RoleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="aspect-square overflow-hidden bg-slate-800/50">
        <img
          src={role.role_image_url}
          alt={role.role_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {role.role_name}
        </h3>

        <p className="text-sm text-slate-400 mb-4">
          上架时间: {formatDate(role.created_at)}
        </p>

        <div className="mt-auto">
          <Button
            onClick={() => onDownload(role)}
            className="w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-cyan-400"
          >
            <Download className="h-4 w-4" />
            下载
          </Button>
        </div>
      </div>
    </div>
  );
}