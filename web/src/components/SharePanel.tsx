'use client';

import React, { useState, useEffect } from 'react';
import { UseWeChatReturn } from '@/hooks/useWeChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Share2, MessageCircle, Users, Loader2 } from 'lucide-react';

interface SharePanelProps {
  wechatData: UseWeChatReturn;
}

export function SharePanel({ wechatData }: SharePanelProps) {
  const { isSDKReady, shareToChat, shareToTimeline } = wechatData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shareOptions, setShareOptions] = useState({
    title: '企业微信应用',
    desc: '这是一个企业微信集成应用，支持用户授权、信息获取、消息分享等功能。',
    link: '',
    imgUrl: '',
  });

  // 在客户端初始化分享选项
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareOptions({
        title: '企业微信应用',
        desc: '这是一个企业微信集成应用，支持用户授权、信息获取、消息分享等功能。',
        link: window.location.href,
        imgUrl: `${window.location.origin}/next.svg`,
      });
    }
  }, []);

  const handleShareToChat = async () => {
    if (!isSDKReady) {
      setError('企业微信SDK未就绪');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await shareToChat(shareOptions);
      setSuccess('分享到聊天成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '分享失败');
    } finally {
      setLoading(false);
    }
  };

  const handleShareToTimeline = async () => {
    if (!isSDKReady) {
      setError('企业微信SDK未就绪');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await shareToTimeline({
        title: shareOptions.title,
        link: shareOptions.link,
        imgUrl: shareOptions.imgUrl,
      });
      setSuccess('分享到朋友圈成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '分享失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>消息分享</CardTitle>
        <CardDescription>
          将应用分享到企业微信聊天或朋友圈
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleShareToChat}
            disabled={!isSDKReady || loading}
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
            <span>分享到聊天</span>
          </Button>

          <Button
            onClick={handleShareToTimeline}
            disabled={!isSDKReady || loading}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Users className="h-6 w-6" />
            )}
            <span>分享到朋友圈</span>
          </Button>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">分享内容：</p>
            <p><strong>标题：</strong>{shareOptions.title}</p>
            <p><strong>描述：</strong>{shareOptions.desc}</p>
            <p><strong>链接：</strong>{shareOptions.link}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}