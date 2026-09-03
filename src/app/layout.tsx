import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '抽象吧应用',
    template: '%s | 抽象吧应用',
  },
  description:
    '抽象吧应用 - 拥有丰富的桌面应用与辅助工具，包括桌宠应用、自动剪辑工具等，所有应用均可免费下载使用',
  keywords: [
    '抽象吧应用',
    '桌面宠物',
    '自动剪辑工具',
    'Windows应用',
    'Tauri',
    '语音互动',
    '角色进化',
    '桌面美化',
    '虚拟宠物',
    '自定义角色',
  ],
  authors: [{ name: '抽象吧应用' }],
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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}