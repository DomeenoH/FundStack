import type { Metadata } from 'next'
import './globals.css'
import { SiteNav } from '@/components/site-nav'

import { getConfig } from '@/lib/config'
import { getCreatorAvatarUrl } from '@/lib/avatar-utils'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig()

  // 使用统一的头像逻辑：自定义 URL → QQ 头像 → 缺省值
  const avatarUrl = getCreatorAvatarUrl(
    config.creator_avatar,
    config.creator_qq_number || config.payment_qq_number,
    640
  );

  // 如果有有效头像(非默认占位符)，使用头像作为 favicon；否则使用默认图标
  const icons = avatarUrl !== '/placeholder-user.jpg' ? {
    icon: avatarUrl,
    apple: avatarUrl,
  } : {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  }

  return {
    title: config.site_title || '温暖投喂小站',
    description: config.site_description || '用贴心的投喂支持创作，快速、安全又安心。',
    icons,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = await getConfig();

  return (
    <html lang="zh-CN">
      <body className={`font-sans antialiased`}>
        <SiteNav config={config} />
        {children}
      </body>
    </html>
  )
}
