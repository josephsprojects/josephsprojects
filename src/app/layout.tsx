import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CuraLog', template: '%s · CuraLog' },
  description: 'The care coordination platform built for families, caregivers, and healthcare teams.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dataprimetech.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
