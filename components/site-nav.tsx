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
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          投喂小站
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-4 py-2 transition-all duration-200',
                pathname === link.href
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'hover:bg-slate-100/80 hover:text-gray-900 hover:shadow-sm'
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
