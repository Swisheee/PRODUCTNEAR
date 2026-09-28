'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Users, UserRound, ArrowUpRight } from 'lucide-react';
const nav = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/explore', label: '탐색', Icon: Compass },
  { href: '/gear/new', label: '장비 등록', Icon: Plus },
  { href: '/clubs', label: '동호회', Icon: Users },
  { href: '/me', label: '마이', Icon: UserRound },
];
export function Navigation() {
  const path = usePathname();
  return (
    <>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-symbol">써</span>써본사람<span className="brand-dot">.</span>
        </Link>
        <p className="brand-caption">경험을 나누면, 선택이 쉬워져요.</p>
        <nav aria-label="주 메뉴">
          {nav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={
                path === href || (href !== '/' && path.startsWith(href))
                  ? 'nav-item active'
                  : 'nav-item'
              }
            >
              <Icon size={21} />
              {label}
              {href === '/gear/new' && <span className="nav-plus">+</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="tiny-label">사람에서 시작하는 선택</span>
          <strong>
            별점보다,
            <br />
            함께 뛰는 사람의 한마디.
          </strong>
          <p>
            써본 경험이 누군가의
            <br />
            좋은 선택이 됩니다.
          </p>
          <Link href="/about">
            써본사람 알아보기 <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="sidebar-footer">SSUBON · 함께 쓰는 경험</div>
      </aside>
      <nav className="bottom-nav" aria-label="모바일 메뉴">
        {nav.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${path === href ? 'active ' : ''}${href === '/gear/new' ? 'add-nav' : ''}`}
          >
            <Icon size={22} />
            <span>{href === '/gear/new' ? '등록' : label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
