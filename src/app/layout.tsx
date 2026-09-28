import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Pwa } from '@/components/pwa';
import { configured } from '@/lib/env';
import './globals.css';
export const metadata: Metadata = {
  title: { default: '써본사람 — 함께 뛰는 사람의 진짜 경험', template: '%s | 써본사람' },
  description: '내가 믿을 수 있는 사람의 실제 사용 경험으로 시작하는 장비 선택.',
  applicationName: '써본사람',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#216754' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <Pwa />
        <Navigation />
        <div className="workspace">
          <header className="topbar">
            <Link href="/" className="mobile-brand">
              써본사람<span>.</span>
            </Link>
            <span className="topbar-caption">좋은 장비보다 먼저, 좋은 경험을 만나요.</span>
            <div className="topbar-actions">
              <Link href="/search" aria-label="검색">
                <Search size={21} />
              </Link>
              <Link href="/notifications" aria-label="알림">
                <Bell size={21} />
              </Link>
              <Link href="/me" className="top-avatar" aria-label="내 프로필">
                나
              </Link>
            </div>
          </header>
          {!configured && (
            <div className="demo-banner">
              <span className="status-dot" />
              둘러보기 모드 <span>모든 인물·동호회·경험은 데모입니다.</span>
              <Link href="/setup">연결 안내 ↗</Link>
            </div>
          )}
          <main id="main">{children}</main>
          <footer className="page-footer">
            <strong>써본사람.</strong>
            <span>함께 쓰는 장비, 서로 나누는 경험.</span>
            <Link href="/about">서비스 소개</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
