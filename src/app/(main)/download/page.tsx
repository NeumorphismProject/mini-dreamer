'use client';

import { DownloadButtons } from '@/components/download-buttons';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function DownloadCenterPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative container mx-auto px-4 pt-24 pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                下载中心
              </h1>
            </div>

            <p className="text-lg text-slate-300/90 leading-8 max-w-2xl mx-auto">
              所有应用均可免费下载使用，选择适合你的平台开始体验
            </p>
          </div>
        </div>
      </section>

      {/* 应用卡片网格 */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <DownloadButtons />

          <p className="mt-8 text-center text-sm text-slate-400">
            更多应用持续更新中，敬请期待
          </p>
        </div>
      </section>
    </div>
  );
}