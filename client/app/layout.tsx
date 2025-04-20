import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '花园网站',
  description: '一个美丽的花园网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
} 