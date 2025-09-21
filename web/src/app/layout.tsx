import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { VConsole } from '@/components/VConsole'

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
        {/* vConsole 早期初始化脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && !window.vConsole) {
                  // 动态加载 vConsole
                  var script = document.createElement('script');
                  script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js';
                  script.onload = function() {
                    if (window.VConsole) {
                      window.vConsole = new window.VConsole({
                        defaultPlugins: ['system', 'network', 'element', 'storage'],
                        maxLogNumber: 1000,
                        disableLogScrolling: false,
                      });
                      
                      // vConsole 会自动捕获 console 日志，无需手动重写
                      // 只需要确保 vConsole 实例正确创建即可

                      console.log('vConsole 已加载 - 支持页面刷新保留日志');
                    }
                  };
                  document.head.appendChild(script);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <VConsole />
      </body>
    </html>
  )
}