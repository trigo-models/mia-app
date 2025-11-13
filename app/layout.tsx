import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import './globals.css'

const rubik = Rubik({ 
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'MIA App - טופס רב שלבי',
  description: 'טופס רב שלבי בעברית עם תמיכה ב-RTL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.variable} font-sans`}>{children}</body>
    </html>
  )
}
