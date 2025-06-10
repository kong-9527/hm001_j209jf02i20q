import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { UserProvider } from './contexts/UserContext'
import { SessionProvider } from './contexts/SessionContext'
import { EventBusProvider } from './contexts/EventBus'
import { ProjectProvider } from './contexts/ProjectContext'
import { NotificationProvider } from './components/NotificationCenter'

export const metadata: Metadata = {
  title: {
    default: 'AI Garden Design | Tailored Garden & Plant Planning',
    template: '%s | AI Garden Design'
  },
  description: 'Design your perfect garden, patio or balcony with AI. Get intelligent garden layouts and personalized plant suggestions.',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'AI Garden Design',
    description: 'Let AI generate the perfect garden layout and recommend ideal plants.',
    url: 'https://aigardendesign.org',
    siteName: 'AI Garden Design',
    images: [
      {
        url: 'https://aigardendesign.org/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Garden Design Preview'
      }
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Garden Design',
    description: 'Let AI generate the perfect garden layout and recommend ideal plants.',
    images: ['https://aigardendesign.org/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://aigardendesign.org',
  },
  authors: [{ name: 'AI Garden Design Team' }],
  metadataBase: new URL('https://aigardendesign.org'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <Script 
          defer 
          data-domain="www.aigardendesign.org" 
          src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
        />
        <Script id="plausible-setup">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
        <UserProvider>
          <SessionProvider>
            <EventBusProvider>
              <ProjectProvider>
                <NotificationProvider>
                  <main>{children}</main>
                </NotificationProvider>
              </ProjectProvider>
            </EventBusProvider>
          </SessionProvider>
        </UserProvider>
      </body>
    </html>
  )
} 