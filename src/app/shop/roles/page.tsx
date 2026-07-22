'use client';

import { useState, useCallback } from 'react';
import { useRoles } from '@/hooks/use-roles';
import { RoleCard } from '@/components/shop/role-card';
import { RoleDownloadDialog } from '@/components/shop/role-download-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Role, ListRolesParams } from '@/types';

export default function RolesPage() {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pageSize = 12;

  const { data, loading, error, refetch } = useRoles({
    page: currentPage,
    page_size: pageSize,
    keyword: searchKeyword,
  });

  const handleSearch = useCallback(() => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    refetch({ page: 1, page_size: pageSize, keyword });
  }, [keyword, refetch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = useCallback((role: Role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    refetch({ page: newPage, page_size: pageSize, keyword: searchKeyword });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">角色商城</h1>

          <div className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜索角色名称..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 rounded-xl border-white/10 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400"
            >
              搜索
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-slate-400">{error}</p>
          </div>
        ) : !data || data.records.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">暂无角色</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.records.map((role) => (
                <RoleCard key={role.id} role={role} onDownload={handleDownload} />
              ))}
            </div>

            {data.total_pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!data.has_prev}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-slate-400">
                  第 {currentPage} / {data.total_pages} 页
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={!data.has_next}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-slate-800/50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <RoleDownloadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={selectedRole}
      />
    </div>
  );
}