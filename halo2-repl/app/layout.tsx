import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import Web3Wrapper from '@/components/Web3Wrapper'
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Halo2REPL',
  description: 'A REPL for Halo2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="#" />
      </head>
      <body className={inter.className}>
        {/* <Web3Wrapper> */}
          {children}
        {/* </Web3Wrapper> */}
        <Analytics />
      </body>
    </html>
  )
}
