'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Cat,
  Film,
  Wrench,
  Gamepad2,
  Workflow,
  Check,
  Store,
  AppWindow,
  Gauge,
  Layers,
  Share2,
  SlidersHorizontal,
  Cpu,
} from 'lucide-react';

// 明星工具：DLSS 5（重点推荐）
const featuredTools = [
  {
    key: 'DLSS5-Swapper',
    name: 'DLSS 5 帧生成工具',
    tagline: '游戏画面的 AI 革命',
    description:
      'DLSS 5 引入 3D 引导神经网络渲染，用 AI 为游戏画面注入照片级写实光照与材质，将实时渲染的真实感推向前所未有的高度。',
    features: [
      { icon: Gauge, text: '3D 引导神经网络渲染，AI 注入照片级光照与材质' },
      { icon: Layers, text: '画面真实度媲美好莱坞大片级视觉' },
      { icon: Sparkles, text: '4K 高分辨率下流畅运行，体验丝滑' },
      { icon: Cpu, text: '20 / 30 / 40 / 50 系列均可支持' },
    ],
    href: '/shop/tools?category=DLSS5-Swapper',
    cta: '进入 DLSS 5 工具',
    accent: 'from-purple-600 to-pink-500',
    shadow: 'shadow-purple-500/25',
    border: 'hover:border-purple-500/60',
    badge: '游戏增强',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    key: 'ComfyUI',
    name: 'ComfyUI AI 创作工具',
    tagline: 'AI 短剧与视觉创作工作台',
    description:
      'ComfyUI 以节点式可视化工作流，让 AI 图像与短剧生成全程可控：从分镜画面到角色一致，每个模型与参数都清晰可见、随心调整。',
    features: [
      { icon: Workflow, text: '节点式可视化工作流，无限画布自由搭建' },
      { icon: Film, text: 'AI 短剧分镜与画面生成，高效创作' },
      { icon: SlidersHorizontal, text: '全参数可控，每个处理步骤都可检查' },
      { icon: Share2, text: '工作流一键保存复用，社区模板随时开箱' },
    ],
    href: '/shop/tools?category=ComfyUI',
    cta: '进入 ComfyUI 工具',
    accent: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/25',
    border: 'hover:border-pink-500/60',
    badge: 'AI 创作',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  },
];

// 工具商城全部分类
const shopCategories = [
  { key: 'DLSS5-Swapper', label: 'DLSS5-Swapper', description: 'DLSS 帧生成替换工具集' },
  { key: '硬件监控', label: '硬件监控', description: '硬件状态监控工具集' },
  { key: '常用工具', label: '常用工具', description: '常用工具集合' },
  { key: 'ComfyUI', label: 'Comfy UI', description: 'ComfyUI 图像生成工具集' },
];

// 自研应用
const selfApps = [
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

export function MainSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950 to-purple-950/40" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[820px] h-[640px] rounded-full bg-gradient-to-r from-purple-600/15 via-slate-950/0 to-pink-500/15 blur-3xl opacity-80" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[480px] rounded-full bg-gradient-to-r from-blue-500/10 via-slate-950/0 to-purple-500/10 blur-3xl opacity-70" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-24">
        {/* ============ Hero 区域 ============ */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 shadow-sm shadow-purple-500/10 mb-8">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <span>工具商城 · 精品工具精选</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white mb-6">
            抽象吧应用
          </h1>
          <p className="text-lg sm:text-xl text-slate-300/90 leading-8 mb-10">
            以<strong className="text-purple-300">工具商城</strong>为核心，聚合游戏增强与 AI 创作精选工具，
            同时提供自研应用
          </p>

          {/* 主 CTA：前往工具商城 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop/tools"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-9 py-4 text-base font-bold text-white shadow-xl shadow-purple-500/30 transition hover:scale-[1.03] hover:shadow-purple-500/40"
            >
              <Store className="h-5 w-5" />
              <span>前往工具商城</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
            >
              <AppWindow className="h-5 w-5 text-cyan-300" />
              自研应用
            </Link>
          </div>
        </div>

        {/* ============ 明星工具（重点推荐） ============ */}
        <div id="features" className="mx-auto mt-24 max-w-6xl scroll-mt-24">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">明星工具</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">两大王牌工具，带你进阶</h2>
            <p className="mt-3 text-sm text-slate-400">来自工具商城的精选力作，点击直达对应分类</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {featuredTools.map((tool) => {
              const Icon = tool.key === 'ComfyUI' ? Workflow : Gamepad2;
              return (
                <div
                  key={tool.key}
                  className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 backdrop-blur transition hover:scale-[1.01] hover:bg-slate-900/70 ${tool.border}`}
                >
                  {/* 顶部渐变光晕 */}
                  <div className={`absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${tool.accent} opacity-10 blur-3xl transition group-hover:opacity-20`} />

                  <div className="flex items-center gap-4 mb-5">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accent} text-white shadow-lg ${tool.shadow} transition group-hover:scale-105`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tool.badgeClass} mb-1.5`}>
                        {tool.badge}
                      </span>
                      <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                      <p className="text-sm text-purple-300/80 font-medium">{tool.tagline}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300/90 leading-relaxed mb-6">
                    {tool.description}
                  </p>

                  <ul className="mb-8 flex flex-col gap-3 flex-1">
                    {tool.features.map((feature, index) => {
                      const FIcon = feature.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tool.accent} text-white`}>
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm text-slate-200 leading-relaxed flex items-center gap-2">
                            <FIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    href={tool.href}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${tool.accent} px-6 py-3.5 text-sm font-bold text-white shadow-lg ${tool.shadow} transition hover:scale-[1.02]`}
                  >
                    {tool.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ 工具商城全部分类 ============ */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">工具商城</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">全部分类</h2>
            </div>
            <Link
              href="/shop/tools"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-300 hover:text-purple-200 transition group"
            >
              查看全部工具
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shopCategories.map((category) => (
              <Link
                key={category.key}
                href={`/shop/tools?category=${encodeURIComponent(category.key)}`}
                className="group rounded-2xl border border-white/10 bg-slate-950/70 p-5 transition hover:border-purple-500/40 hover:bg-slate-900/70 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/25 to-pink-500/25 border border-purple-500/25 text-purple-300 mb-3 transition group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{category.label}</p>
                <p className="text-xs text-slate-400">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ============ 自研应用 ============ */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">自研应用</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">我们自主研发的桌面应用</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {selfApps.map((app, index) => {
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
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition group-hover:gap-2">
                    前往下载
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
