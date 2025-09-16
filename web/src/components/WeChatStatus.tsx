'use client';

import React from 'react';
import { useWeChat } from '@/hooks/useWeChat';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, Smartphone } from 'lucide-react';

export function WeChatStatus() {
  const { isInWeChat, isSDKReady, isConfigLoaded, loading, error, initSDK, clearError } = useWeChat();

  if (loading) {
    return (
      <Alert>
        <Loader2 className="h-5 w-5 animate-spin" />
        <AlertDescription>
          正在初始化企业微信SDK...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-5 w-5" />
        <div className="flex-1">
          <AlertDescription className="mb-2">
            {error}
          </AlertDescription>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={clearError}>
              清除错误
            </Button>
            {isInWeChat && (
              <Button size="sm" onClick={initSDK}>
                重新初始化
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  if (!isInWeChat) {
    return (
      <Alert variant="warning">
        <Smartphone className="h-5 w-5" />
        <AlertDescription>
          请在企业微信中打开此应用以获得完整功能
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConfigLoaded) {
    return (
      <Alert variant="warning">
        <Loader2 className="h-5 w-5 animate-spin" />
        <AlertDescription>
          企业微信SDK配置中...
        </AlertDescription>
      </Alert>
    );
  }

  if (!isSDKReady) {
    return (
      <Alert variant="warning">
        <Loader2 className="h-5 w-5 animate-spin" />
        <AlertDescription>
          企业微信SDK初始化中...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="success">
      <CheckCircle className="h-5 w-5" />
      <AlertDescription>
        企业微信SDK已就绪，所有功能可用
      </AlertDescription>
    </Alert>
  );
}
