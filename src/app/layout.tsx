import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AppLayout, ThemeProvider } from '@/components/layout';
import { SaveModal, DeleteConfirm } from '@/components/business';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SoundAI - AI智能音频素材平台',
    template: '%s | SoundAI',
  },
  description:
    'SoundAI是专业的AI音频素材平台，提供海量无版权音效、背景音乐智能生成服务，让创意音频触手可及',
  keywords: [
    'AI音效',
    '音频素材',
    '音效生成',
    '背景音乐',
    '无版权音乐',
    '免版税音效',
    'AI作曲',
    '声音设计',
    'SoundAI',
  ],
  authors: [{ name: 'SoundAI Team' }],
  generator: 'Coze Code',
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isDev && <Inspector />}
          <AppLayout>
            {children}
          </AppLayout>
          <SaveModal />
          <DeleteConfirm />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
