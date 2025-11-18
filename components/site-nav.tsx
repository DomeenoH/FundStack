'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: '投喂首页' },
  { href: '/list', label: '投喂墙' },
  { href: '/analytics', label: '投喂数据' },
  { href: '/admin', label: '管理面板' },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Hexo Donate Plus
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-600">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded px-3 py-2 transition-colors hover:bg-slate-100 hover:text-gray-900',
                pathname === link.href && 'bg-slate-900 text-white hover:bg-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

