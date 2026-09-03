'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Cat, Film, Wrench, Palette, Mic, TrendingUp, Image, Music } from 'lucide-react';

// 网站应用概览
const siteApps = [
  {
    icon: Cat,
    name: '抽象版桌宠应用',
    description: '可爱的桌面宠物，支持语音互动与角色进化',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Film,
    name: '自动剪辑工具',
    description: '智能视频剪辑，一键生成精彩内容',
    color: 'from-purple-500 to-pink-400',
  },
];

// 桌宠核心特性
const petFeatures = [
  { icon: Palette, title: '高度自定义', description: '自定义宠物形象与行为，上传任意图片打造专属伙伴' },
  { icon: Mic, title: '语音互动', description: '说出触发词，宠物立即做出对应动作' },
  { icon: TrendingUp, title: '进化系统', description: 'V0 → V1 → V2，体验三段成长进化' },
];

// 内置免费工具
const builtInTools = [
  { icon: Image, title: '图片处理', description: '图片格式转换、图片裁剪等便捷功能', color: 'from-green-500 to-emerald-500' },
  { icon: Film, title: '视频处理', description: '常用视频格式转换、音视频分离等简易功能', color: 'from-purple-500 to-violet-500' },
  { icon: Music, title: '音频处理', description: '常用音频格式转换，轻松处理音频文件', color: 'from-pink-500 to-rose-500' },
];

export function MainSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950 to-blue-950/40" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[780px] h-[620px] rounded-full bg-gradient-to-r from-blue-500/15 via-slate-950/0 to-purple-500/15 blur-3xl opacity-80" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-24">
        {/* Hero 区域 */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm shadow-blue-500/10 mb-8">
            <Sparkles className="h-4 w-4 text-blue-200" />
            <span>桌宠应用中心，丰富工具任你挑选</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white mb-6">
            抽象吧应用
          </h1>
          <p className="text-lg sm:text-xl text-slate-300/90 leading-8 mb-10">
            拥有丰富的桌面应用与辅助工具，包括桌宠应用、自动剪辑工具等，所有应用均可免费下载使用
          </p>

          {/* 前往下载中心按钮 */}
          <Link
            href="/download"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.03] hover:shadow-blue-500/40"
          >
            <span>前往下载中心</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* 应用概览 */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {siteApps.map((app, index) => {
              const Icon = app.icon;
              return (
                <Link
                  key={index}
                  href="/download"
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-8 transition hover:border-white/20 hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{app.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-300 transition group-hover:gap-2">
                    前往下载
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 核心特性与免费工具 */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* 桌宠核心特性 */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">桌宠特性</p>
                <h2 className="text-2xl font-semibold text-white">精彩体验</h2>
              </div>
            </div>
            <div className="grid gap-4">
              {petFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-blue-400/30 hover:bg-slate-950/80">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <p className="mt-1 text-sm text-slate-300/80">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 内置免费工具 */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">内置工具</p>
                <h2 className="text-2xl font-semibold text-white">免费使用</h2>
              </div>
            </div>
            <div className="grid gap-4">
              {builtInTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-green-400/30 hover:bg-slate-950/80">
                    <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{tool.title}</p>
                      <p className="mt-1 text-sm text-slate-300/80">{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}