import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '企业微信应用',
  description: '企业微信集成应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 企业微信JS-SDK - 只在客户端加载，避免重复加载 */}
        <script 
          src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"
          async
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}