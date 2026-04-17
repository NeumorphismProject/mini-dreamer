'use client';

import { Header } from './header';
import { AudioPlayerBar } from '@/components/audio/audio-player-bar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <AudioPlayerBar />
    </div>
  );
}
