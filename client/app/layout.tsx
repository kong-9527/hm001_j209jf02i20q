import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Garden Design',
  description: 'AI Garden Design',
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