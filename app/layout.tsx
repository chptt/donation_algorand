import type { Metadata } from 'next'
import './globals.css'
import AlgorandProviders from '@/components/AlgorandProviders'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Donation Platform',
  description: 'Blockchain-powered donation platform on Algorand',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AlgorandProviders>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </AlgorandProviders>
      </body>
    </html>
  )
}
