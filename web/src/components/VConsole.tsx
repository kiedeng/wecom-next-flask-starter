'use client';

import { useEffect } from 'react';

export function VConsole() {
  useEffect(() => {
    // 检查 vConsole 是否已经通过 script 标签加载
    if (typeof window !== 'undefined' && window.vConsole) {
      console.log('vConsole 已通过 script 标签加载');
      
      // 添加日志持久化功能
      const saveLogs = () => {
        try {
          localStorage.setItem('vconsole_timestamp', Date.now().toString());
        } catch (e) {
          console.warn('保存日志时间戳失败:', e);
        }
      };

      // 页面卸载时保存
      window.addEventListener('beforeunload', saveLogs);
      
      // 定期保存（每10秒）
      const interval = setInterval(saveLogs, 10000);
      
      // 清理函数
      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', saveLogs);
      };
    } else if (typeof window !== 'undefined' && !window.vConsole) {
      // 如果 script 标签加载失败，使用 npm 包作为备用
      import('vconsole').then((VConsole) => {
        const vConsole = new VConsole.default({
          defaultPlugins: ['system', 'network', 'element', 'storage'],
          maxLogNumber: 1000,
          disableLogScrolling: false,
        });
        window.vConsole = vConsole;
        console.log('vConsole 已通过 npm 包加载');
      }).catch((error) => {
        console.error('vConsole 加载失败:', error);
      });
    }
  }, []);

  return null;
}

// 扩展 Window 接口
declare global {
  interface Window {
    vConsole: any;
  }
}
