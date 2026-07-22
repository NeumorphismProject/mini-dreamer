'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DonateDialog } from '@/components/donate-dialog';
import { Menu, X, ChevronDown, Store, Heart } from 'lucide-react';

const navigation = [
  { label: '首页', href: '/' },
  { label: '功能特性', href: '#features' },
  { label: '下载', href: '#download' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20 overflow-hidden">
                <img
                  src="/logo.jpeg"
                  alt="抽象吧桌宠"
                  className="w-7 h-7 object-cover rounded-xl"
                />
              </div>
              <span className="font-semibold text-white">抽象吧桌宠</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                      <Store className="h-4 w-4" />
                      商城
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-40 bg-slate-900/95 border-white/10 backdrop-blur-xl"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href="/shop/roles"
                        className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800/50"
                      >
                        角色商城
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => setDonateOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  捐赠
                </button>
              </nav>
              <Link
                href="#download"
                className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-cyan-400"
              >
                立即下载
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="切换菜单"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </Button>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/shop/roles"
                  className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Store className="h-4 w-4" />
                  角色商城
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setDonateOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors py-2 text-left"
                >
                  <Heart className="h-4 w-4" />
                  捐赠
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </>
  );
}
