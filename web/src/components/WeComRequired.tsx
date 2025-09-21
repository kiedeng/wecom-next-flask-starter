'use client';

import React from 'react';

interface WeComRequiredProps {
  isWeChat: boolean;
  onRetry?: () => void;
}

export const WeComRequired: React.FC<WeComRequiredProps> = ({ isWeChat, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            请在企业微信中打开
          </h2>
          <p className="text-gray-600 mb-6">
            {isWeChat 
              ? '检测到您在微信中打开，请切换到企业微信客户端' 
              : '此应用需要在企业微信客户端中运行，请使用企业微信打开此链接'
            }
          </p>
        </div>

        <div className="space-y-4">
          {isWeChat ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 如果您有企业微信，请：
                <br />1. 复制当前链接
                <br />2. 切换到企业微信
                <br />3. 粘贴链接打开
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📱 请下载企业微信客户端：
                <br />• 手机端：应用商店搜索"企业微信"
                <br />• 电脑端：访问 work.weixin.qq.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
