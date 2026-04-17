'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, AudioWaveform, Clock, Star, Tag, Sparkles, ChevronDown, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mainNavItems = [
  {
    href: '/sound-effects',
    label: '音效库',
    icon: AudioWaveform,
  },
  {
    href: '/premium-sound-effects',
    label: '精选音效',
    icon: Star,
    isPremium: true,
  },
  {
    href: '/generate',
    label: 'AI生成',
    icon: Sparkles,
  },
  {
    href: '/audio-editor',
    label: '音频编辑器',
    icon: Scissors,
    isHighlight: true,
  },
];

const moreNavItems = [
  {
    href: '/temp-audio',
    label: '临时音频',
    icon: Clock,
    description: '临时存储的音频文件',
  },
  {
    href: '/tags',
    label: '标签管理',
    icon: Tag,
    description: '管理音效标签分类',
  },
];

export function Header() {
  const pathname = usePathname();

  const isMoreActive = moreNavItems.some(item => pathname === item.href);

  return (
    <header className="sticky top-0 z-50 w-full nav-bar">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <Music className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:inline">
            Sound<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isPremium = item.isPremium;
            const isHighlight = item.isHighlight;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isPremium && !isActive && 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-950/30',
                    isPremium && isActive && 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-950/50',
                    isHighlight && !isActive && 'text-primary hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isMoreActive ? 'secondary' : 'ghost'} 
                size="sm"
                className="gap-1"
              >
                <span className="hidden sm:inline">更多</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 cursor-pointer',
                        isActive && 'bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/generate">
            <Button size="sm" className="gap-2 font-medium">
              开始创作
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
