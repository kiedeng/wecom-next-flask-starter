'use client';

import React, { useState } from 'react';
import { UseWeChatReturn } from '@/hooks/useWeChat';
import { wechatAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Send, Loader2 } from 'lucide-react';

interface MessageSenderProps {
  wechatData: UseWeChatReturn;
}

export function MessageSender({ wechatData }: MessageSenderProps) {
  const { userInfo } = wechatData;
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'markdown'>('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!userInfo?.UserId) {
      setError('请先获取用户信息');
      return;
    }

    if (!message.trim()) {
      setError('请输入消息内容');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await wechatAPI.sendMessage({
        userid: userInfo.UserId,
        type: messageType,
        content: message.trim(),
      });

      if (response.success) {
        setSuccess('消息发送成功');
        setMessage('');
      } else {
        setError(response.error || '消息发送失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '消息发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>发送消息</CardTitle>
        <CardDescription>
          向当前用户发送企业微信消息
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

        {!userInfo?.UserId && (
          <Alert variant="warning">
            <AlertDescription>
              请先获取用户信息才能发送消息
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              消息类型
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'text' | 'markdown')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">文本消息</option>
              <option value="markdown">Markdown消息</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              消息内容
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                messageType === 'text' 
                  ? '请输入要发送的文本消息...'
                  : '请输入Markdown格式的消息...\n\n示例：\n# 标题\n**粗体文本**\n*斜体文本*'
              }
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              字符数: {message.length}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!userInfo?.UserId || loading || !message.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>发送消息</span>
            </Button>
          </div>
        </div>

        {messageType === 'markdown' && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Markdown语法示例：</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><code># 标题</code> - 一级标题</p>
              <p><code>## 标题</code> - 二级标题</p>
              <p><code>**粗体**</code> - 粗体文本</p>
              <p><code>*斜体*</code> - 斜体文本</p>
              <p><code>`代码`</code> - 行内代码</p>
              <p><code>- 列表项</code> - 无序列表</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}