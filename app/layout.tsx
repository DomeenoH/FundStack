import type { Metadata } from 'next'
import './globals.css'
import { SiteNav } from '@/components/site-nav'

import { getConfig } from '@/lib/config'
import { getQQAvatarUrl } from '@/lib/avatar-utils'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig()
  const qq = config.creator_qq_number || config.payment_qq_number

  const icons = qq ? {
    icon: getQQAvatarUrl(qq, 640),
    apple: getQQAvatarUrl(qq, 640),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`font-sans antialiased`}>
        <SiteNav />
        {children}
      </body>
    </html>
  )
}
