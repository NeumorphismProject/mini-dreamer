'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Shield, 
  Headphones,
  Wand2,
  ArrowRight,
  Play,
  Star,
  Music2,
  Waves,
  Volume2
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Wand2,
      title: 'AI 智能生成',
      description: '描述您想要的音效，AI 将在数秒内为您生成独一无二的音频素材',
    },
    {
      icon: Shield,
      title: '无版权风险',
      description: '所有生成的音频素材均可自由商用，无需担心版权问题',
    },
    {
      icon: Zap,
      title: '极速生成',
      description: '秒级响应，高效创作，让灵感即刻转化为现实',
    },
    {
      icon: Globe,
      title: '多场景覆盖',
      description: '涵盖游戏、影视、广告、播客等多种应用场景',
    },
  ];

  const stats = [
    { value: '10,000+', label: '音效素材' },
    { value: '50,000+', label: '生成次数' },
    { value: '100%', label: '版权无忧' },
    { value: '超低价格', label: '费用' },
  ];

  const categories = [
    {
      icon: Volume2,
      title: '环境音效',
      description: '自然、城市、室内等环境氛围音',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Music2,
      title: '音乐片段',
      description: '短小精悍的音乐loop和旋律',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      icon: Waves,
      title: '过渡音效',
      description: '转场、whoosh、冲击音效',
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      icon: Star,
      title: '特殊音效',
      description: '科幻、魔法、游戏特效音',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>AI 驱动的音频创作平台</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              让创意声音
              <br />
              <span className="text-primary">触手可及</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              SoundAI 是专业的 AI 音频素材平台，提供海量无版权音效与背景音乐，
              支持智能生成，让您的创作自由无限
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  开始创作
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sound-effects">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12">
                  <Headphones className="h-5 w-5" />
                  浏览音效库
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container px-4 mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              为什么选择 SoundAI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              我们致力于为创作者提供最优质的音频素材服务
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              丰富的音效类别
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              覆盖各类创作场景，满足您的多元化需求
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div 
                  key={index} 
                  className="group p-6 rounded-xl border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/sound-effects">
              <Button variant="outline" size="lg" className="gap-2">
                查看全部音效
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="container px-4 mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 sm:py-20 text-center">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground mb-4">
              准备好开始创作了吗？
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              立即体验 AI 音频生成，让您的创意声音变为现实
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-8 h-12">
                  立即开始
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/premium-sound-effects">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 text-base px-8 h-12 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Star className="h-5 w-5" />
                  浏览精选
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              <span>© 2026 SoundAI. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/sound-effects" className="hover:text-foreground transition-colors">
                音效库
              </Link>
              <Link href="/premium-sound-effects" className="hover:text-foreground transition-colors">
                精选音效
              </Link>
              <Link href="/generate" className="hover:text-foreground transition-colors">
                AI生成
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
