'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: '投喂首页' },
  { href: '/list', label: '投喂墙' },
  { href: '/analytics', label: '投喂数据' },
  { href: '/admin', label: '管理面板' },
];

export function SiteNav() {
  const pathname = usePathname();
  const activeIndex = NAV_LINKS.findIndex((link) => link.href === pathname);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-slate-800 hover:text-slate-600 transition-colors duration-300"
        >
          投喂小站
        </Link>
        <nav className="relative flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative z-10 rounded-lg px-4 py-2 transition-colors duration-300',
                pathname === link.href
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
          {activeIndex !== -1 && (
            <motion.div
              className="absolute h-[36px] rounded-lg bg-slate-200/80 shadow-sm"
              initial={false}
              animate={{
                x: activeIndex * 88 + 4,
                width: 80,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              style={{
                left: 0,
                top: '50%',
                translateY: '-50%',
              }}
            />
          )}
        </nav>
      </div>
    </header>
  );
}
