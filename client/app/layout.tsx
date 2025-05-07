import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { UserProvider } from './contexts/UserContext'
import { SessionProvider } from './contexts/SessionContext'
import { EventBusProvider } from './contexts/EventBus'

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
        <Script 
          defer 
          data-domain="aigardendesign.org" 
          src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
        />
        <Script id="plausible-setup">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
        <UserProvider>
          <SessionProvider>
            <EventBusProvider>
              <main>{children}</main>
            </EventBusProvider>
          </SessionProvider>
        </UserProvider>
      </body>
    </html>
  )
} 