'use client';

import { useEffect } from 'react';
import { useWeChat } from '@/hooks/useWeChat';
import { setAuthCode } from '@/lib/api';
import { WeComRequired } from '@/components/WeComRequired';
import { WeChatStatus } from '@/components/WeChatStatus';
import { UserInfo } from '@/components/UserInfo';
import { SharePanel } from '@/components/SharePanel';
import { MessageSender } from '@/components/MessageSender';
import { DebugInfo } from '@/components/DebugInfo';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function HomeContent() {
  // Hooks必须在组件顶层调用，不能在try-catch中
  const { 
    isInWeChat, 
    isWeChat, 
    showWeComRequired, 
    authCode, 
    setShowWeComRequired,
    error
  } = useWeChat();

  // 调试信息
  console.log('isInWeChat', authCode);
  console.log('API_BASE_URL', process.env.NEXT_PUBLIC_API_URL);
  console.log('NODE_ENV', process.env.NODE_ENV);

  // 设置授权码到API客户端
  useEffect(() => {
    if (authCode) {
      setAuthCode(authCode);
    }
  }, [authCode]);

  // 如果有错误，显示错误页面
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">应用初始化失败</h1>
          <p className="text-gray-600 mb-4">错误信息: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  // 如果检测到不在企业微信中，显示提示页面
  if (showWeComRequired) {
    return (
      <WeComRequired 
        isWeChat={isWeChat}
        onRetry={() => setShowWeComRequired(false)}
      />
    );
  }

  // 如果还在检测中，显示加载状态
  if (!isInWeChat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在检测客户端...</p>
        </div>
      </div>
    );
  }

  // 全局弹窗防护
  useEffect(() => {
    // 重写alert和confirm，防止企业微信弹窗
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    window.alert = (message: string) => {
      console.log('被阻止的alert:', message);
      // 不显示弹窗，只在控制台记录
    };
    
    window.confirm = (message?: string) => {
      console.log('被阻止的confirm:', message);
      return false; // 默认返回false
    };

    // 监听企业微信错误，防止弹窗
    if (typeof window !== 'undefined' && window.wx) {
      const originalError = window.wx.error;
      window.wx.error = (res: any) => {
        console.error('企业微信JS-SDK错误:', res);
        // 不调用原始错误处理，避免弹窗
      };
    }

    // 清理函数
    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            企业微信应用
          </h1>
          <p className="text-gray-600">
            完整的企业微信集成应用，支持用户授权、信息获取、消息分享等功能
          </p>
        </div>

        <div className="space-y-6">
          {/* 企业微信状态 */}
          <WeChatStatus />

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 用户信息 */}
            <div className="lg:col-span-1">
              <UserInfo />
            </div>

            {/* 消息发送 */}
            <div className="lg:col-span-1">
              <MessageSender />
            </div>
          </div>

          {/* 分享功能 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <SharePanel />
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">功能说明</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">用户授权</h3>
                <p className="text-sm text-gray-600">OAuth2.0安全授权</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">用户信息</h3>
                <p className="text-sm text-gray-600">获取用户基本信息</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">消息分享</h3>
                <p className="text-sm text-gray-600">分享到聊天和朋友圈</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">响应式设计</h3>
                <p className="text-sm text-gray-600">适配移动端和桌面端</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 调试信息组件 */}
      <DebugInfo />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}