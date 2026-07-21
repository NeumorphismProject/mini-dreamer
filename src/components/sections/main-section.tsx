'use client';

import { DownloadButtons } from '@/components/download-buttons';
import { Sparkles, Palette, Mic, TrendingUp, Zap, Film, Music, Image, Wrench } from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: '高度自定义',
    description: '自由定制宠物形象，上传任意角色图片',
  },
  {
    icon: Mic,
    title: '语音互动',
    description: '说出触发词，宠物立即做出对应动作',
  },
  {
    icon: TrendingUp,
    title: '进化系统',
    description: 'V0 → V1 → V2，体验三段成长进化',
  },
  {
    icon: Zap,
    title: '必杀技能',
    description: 'V2 终极形态释放华丽必杀技',
  },
];

const tools = [
  {
    icon: Image,
    title: '图片处理',
    description: '图片格式转换、图片裁剪等便捷功能',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Film,
    title: '视频处理',
    description: '常用视频格式转换、音视频分离等简易功能',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Music,
    title: '音频处理',
    description: '常用音频格式转换，轻松处理音频文件',
    color: 'from-pink-500 to-rose-500',
  },
];

export function MainSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950 to-blue-950/40" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[780px] h-[620px] rounded-full bg-gradient-to-r from-blue-500/15 via-slate-950/0 to-purple-500/15 blur-3xl opacity-80" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.85fr]">
          <div className="space-y-8 text-slate-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm shadow-blue-500/10">
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span>专业桌面宠物，轻松安装</span>
            </div>

            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                让桌面焕然一新，下载你的专属桌宠
              </h1>
              <p className="text-lg sm:text-xl text-slate-300/90 leading-8">
                支持 Windows 稳定版本，一键下载即可安装。内置丰富好用的免费工具，包括图片处理、视频处理和音频处理功能。Mac 版本正在加速开发，敬请期待。
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70 mb-3">下载中心</p>
                  <h2 className="text-2xl font-semibold text-white">选择你的平台</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    点击 Windows 按钮展开更多下载方式
                  </p>
                </div>
                <div id="download">
                  <DownloadButtons />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  推荐优先下载 Windows 版本，Mac 用户可关注最新更新提醒。
                </p>
              </div>
            </div>
          </div>

          <div className="relative space-y-8">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl ring-1 ring-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300/80">核心特性</p>
                  <h2 className="text-3xl font-semibold text-white">精彩体验</h2>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-blue-400/30 hover:bg-slate-950/80">
                      <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{feature.title}</p>
                        <p className="mt-1 text-sm text-slate-300/80">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl ring-1 ring-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                  <Wrench className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300/80">免费工具</p>
                  <h2 className="text-3xl font-semibold text-white">强大功能</h2>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-green-400/30 hover:bg-slate-950/80">
                      <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{tool.title}</p>
                        <p className="mt-1 text-sm text-slate-300/80">{tool.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}