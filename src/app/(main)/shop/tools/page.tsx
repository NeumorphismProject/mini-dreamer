'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToolFiles } from '@/hooks/use-tool-files';
import { ToolCard } from '@/components/shop/tool-card';
import { ToolDownloadDialog } from '@/components/shop/tool-download-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Package,
  FolderOpen,
} from 'lucide-react';
import type { ToolFile } from '@/types';

interface ToolCategory {
  key: string;
  label: string;
  description: string;
}

const toolCategories: ToolCategory[] = [
  {
    key: 'DLSS5-Swapper',
    label: 'DLSS5-Swapper',
    description: 'DLSS 帧生成替换工具集',
  },
];

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>(toolCategories[0].key);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTool, setSelectedTool] = useState<ToolFile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pageSize = 20;

  const { data, loading, error, refetch } = useToolFiles({
    page: currentPage,
    page_size: pageSize,
    keyword: searchKeyword,
    tool_type: activeCategory,
  });

  // 切换目录时重置页码并重新获取数据
  const handleCategoryChange = useCallback((categoryKey: string) => {
    setActiveCategory(categoryKey);
    setCurrentPage(1);
    setKeyword('');
    setSearchKeyword('');
    refetch({
      page: 1,
      page_size: pageSize,
      keyword: '',
      tool_type: categoryKey,
    });
  }, [refetch]);

  const handleSearch = useCallback(() => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    refetch({
      page: 1,
      page_size: pageSize,
      keyword,
      tool_type: activeCategory,
    });
  }, [keyword, activeCategory, refetch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownload = useCallback((toolFile: ToolFile) => {
    setSelectedTool(toolFile);
    setDialogOpen(true);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    refetch({
      page: newPage,
      page_size: pageSize,
      keyword: searchKeyword,
      tool_type: activeCategory,
    });
  };

  const activeCategoryInfo = toolCategories.find(c => c.key === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧工具目录 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">工具目录</h2>
                  <p className="text-xs text-slate-500">Tool Categories</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/50 border border-white/5">
                {toolCategories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-300 overflow-hidden ${
                      activeCategory === category.key
                        ? 'bg-gradient-to-r from-purple-600/25 to-pink-500/25 scale-[1.03] translate-x-0.5 shadow-lg shadow-purple-500/10 border border-purple-500/30'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    {/* 选中状态左侧发光条 */}
                    {activeCategory === category.key && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-white via-purple-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    )}

                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                      activeCategory === category.key
                        ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/30'
                        : 'bg-slate-800/50 text-slate-400 group-hover:text-purple-400'
                    }`}>
                      <Wrench className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-sm font-semibold truncate ${
                        activeCategory === category.key
                          ? 'text-white'
                          : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {category.label}
                      </span>
                      <span className={`text-xs truncate ${
                        activeCategory === category.key
                          ? 'text-purple-200/80'
                          : 'text-slate-500'
                      }`}>
                        {category.description}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* 目录底部装饰 */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">目录说明</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  左侧选择工具分类后，右侧将展示对应的工具列表，点击下载即可获取工具安装包。
                </p>
              </div>
            </div>
          </aside>

          {/* 右侧工具列表 */}
          <main className="flex-1 min-w-0">
            {/* 标题与搜索 */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    工具商城
                  </h1>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    当前分类：
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium">
                      <Wrench className="h-3 w-3" />
                      {activeCategoryInfo?.label}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 max-w-md w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="搜索工具文件名..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-10 rounded-xl border-white/10 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-purple-500/50"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 font-semibold shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-pink-400"
                  >
                    搜索
                  </Button>
                </div>
              </div>
            </div>

            {/* 加载状态 */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-slate-400">正在加载工具列表...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-slate-400 mb-4">{error}</p>
                <Button
                  onClick={() => refetch({
                    page: currentPage,
                    page_size: pageSize,
                    keyword: searchKeyword,
                    tool_type: activeCategory,
                  })}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500"
                >
                  重试加载
                </Button>
              </div>
            ) : !data || data.records.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/10">
                  <Package className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-400">
                  {searchKeyword
                    ? `未找到包含「${searchKeyword}」的工具`
                    : '暂无工具，请稍后再来查看'}
                </p>
              </div>
            ) : (
              <>
                {/* 工具卡片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {data.records.map((toolFile) => (
                    <ToolCard
                      key={toolFile.id}
                      toolFile={toolFile}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>

                {/* 分页 */}
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

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">第</span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/25">
                        {currentPage}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400 font-medium">{data.total_pages}</span>
                      <span className="text-slate-500">页</span>
                      <span className="text-slate-600 ml-2">
                        · 共 {data.total} 个工具
                      </span>
                    </div>

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
          </main>
        </div>
      </div>

      {/* 下载确认对话框 */}
      <ToolDownloadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        toolFile={selectedTool}
      />
    </div>
  );
}
