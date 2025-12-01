'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { SiteConfig } from '@/lib/config';
import { getQQAvatarUrl } from '@/lib/avatar-utils';

const NAV_LINKS = [
  { href: '/', label: '投喂首页' },
  { href: '/list', label: '投喂墙' },
  { href: '/analytics', label: '投喂数据' },
  { href: '/admin', label: '管理面板' },
];

interface SiteNavProps {
  config?: SiteConfig;
}

export function SiteNav({ config }: SiteNavProps) {
  const pathname = usePathname();
  const activeIndex = NAV_LINKS.findIndex((link) => link.href === pathname);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeTabStyle, setActiveTabStyle] = useState({ x: 0, width: 0 });

  useEffect(() => {
    if (activeIndex === -1 || !navRef.current || !linkRefs.current[activeIndex]) return;

    const updateTabPosition = () => {
      const navRect = navRef.current?.getBoundingClientRect();
      const activeTabRect = linkRefs.current[activeIndex]?.getBoundingClientRect();

      if (navRect && activeTabRect) {
        setActiveTabStyle({
          x: activeTabRect.left - navRect.left,
          width: activeTabRect.width,
        });
      }
    };

    updateTabPosition();
    window.addEventListener('resize', updateTabPosition);
    return () => window.removeEventListener('resize', updateTabPosition);
  }, [activeIndex]);

  const siteTitle = config?.site_title || '投喂小站';
  const showAvatar = config?.site_nav_show_avatar || false;

  // Resolve avatar URL
  // Resolve avatar URL
  let avatarUrl = '/placeholder-user.jpg';

  // Priority: Custom Avatar > Creator QQ > Payment QQ > Placeholder
  if (config?.payment_qq_number) {
    avatarUrl = getQQAvatarUrl(config.payment_qq_number);
  }
  if (config?.creator_qq_number) {
    avatarUrl = getQQAvatarUrl(config.creator_qq_number);
  }
  if (config?.creator_avatar && config.creator_avatar !== '/placeholder-user.jpg') {
    avatarUrl = config.creator_avatar;
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-3 md:px-4 py-3">
        <Link
          href="/"
          className="font-bold text-lg md:text-xl tracking-tight text-slate-800 hover:text-slate-600 transition-colors duration-300 shrink-0 flex items-center gap-2"
        >
          {showAvatar && (
            <img
              src={avatarUrl}
              alt="Logo"
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          )}
          {siteTitle}
        </Link>
        <nav ref={navRef} className="relative flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-medium">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              ref={(el) => { linkRefs.current[index] = el; }}
              href={link.href}
              className={cn(
                'relative z-10 rounded-lg px-2 md:px-4 py-2 transition-colors duration-300 whitespace-nowrap',
                pathname === link.href
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
          {activeIndex !== -1 && activeTabStyle.width > 0 && (
            <motion.div
              className="absolute h-[36px] rounded-lg bg-slate-200/80 shadow-sm"
              initial={false}
              animate={{
                x: activeTabStyle.x,
                width: activeTabStyle.width,
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
