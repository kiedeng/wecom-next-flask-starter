'use client';

import React, { useState, useEffect } from 'react';
import { UseWeChatReturn } from '@/hooks/useWeChat';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Bug, Copy, RefreshCw } from 'lucide-react';

interface DebugInfo {
  [key: string]: any;
}

interface DebugInfoProps {
  wechatData?: UseWeChatReturn;
}

export function DebugInfo({ wechatData }: DebugInfoProps) {
  // 只在开发环境显示调试信息
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 检查是否有调试信息
    const checkDebugInfo = () => {
      if (typeof window !== 'undefined' && (window as any).wechatDebugInfo) {
        setDebugInfo((window as any).wechatDebugInfo);
      }
    };

    checkDebugInfo();
    
    // 定期检查调试信息
    const interval = setInterval(checkDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async () => {
    if (debugInfo) {
      const debugText = JSON.stringify(debugInfo, null, 2);
      try {
        await navigator.clipboard.writeText(debugText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  const refreshDebugInfo = () => {
    if (typeof window !== 'undefined' && (window as any).wechatDebugInfo) {
      setDebugInfo((window as any).wechatDebugInfo);
    }
  };

  // 合并wechatData和window调试信息
  const combinedDebugInfo = {
    wechatData: wechatData || null,
    windowDebugInfo: debugInfo,
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE_URL: process.env.NEXT_PUBLIC_API_URL,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
    }
  };

  // 如果没有调试信息且不可见或已关闭，显示按钮
  if (!debugInfo && !isVisible || isClosed) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsVisible(true);
            setIsClosed(false);
          }}
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          显示调试信息
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Bug className="h-4 w-4 mr-2 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">调试信息</h3>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshDebugInfo}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsClosed(true)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </div>

        {copied && (
          <Alert className="mb-3">
            <AlertDescription className="text-green-600">
              调试信息已复制到剪贴板
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          {Object.entries(combinedDebugInfo).map(([key, value]) => (
            <div key={key} className="border-b border-yellow-200 pb-2">
              <div className="font-medium text-yellow-700">{key}:</div>
              <div className="text-yellow-600 break-all">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-yellow-600">
          提示：点击复制按钮将调试信息复制到剪贴板，然后可以发送给开发者
        </div>
      </Card>
    </div>
  );
}