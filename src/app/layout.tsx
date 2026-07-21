import type { Metadata } from 'next';
import { Header, Footer, ThemeProvider } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '抽象吧桌宠 - Windows 桌面宠物应用',
    template: '%s | 抽象吧桌宠',
  },
  description:
    '一款基于 Tauri 2 开发的 Windows 桌面宠物应用，支持语音互动、角色进化系统和高度自定义功能',
  keywords: [
    '桌面宠物',
    'Windows应用',
    'Tauri',
    '语音互动',
    '角色进化',
    '桌面美化',
    '虚拟宠物',
    '自定义角色',
  ],
  authors: [{ name: '抽象吧桌宠团队' }],
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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}