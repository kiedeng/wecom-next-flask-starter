'use client';

import { useState, useEffect, useCallback } from 'react';
import { wechatAPI } from '@/lib/api';
import { wechatSDK, WeChatConfig, WeChatUserInfo } from '@/lib/wechat';
import { isInWeChatWork, getUrlParam } from '@/lib/utils';

export interface UseWeChatReturn {
  // 状态
  isInWeChat: boolean;
  isSDKReady: boolean;
  isConfigLoaded: boolean;
  userInfo: WeChatUserInfo | null;
  loading: boolean;
  error: string | null;

  // 方法
  initSDK: () => Promise<void>;
  getUserInfo: (code?: string) => Promise<void>;
  shareToChat: (options: {
    title: string;
    desc: string;
    link: string;
    imgUrl?: string;
  }) => Promise<void>;
  shareToTimeline: (options: {
    title: string;
    link: string;
    imgUrl?: string;
  }) => Promise<void>;
  closeWindow: () => void;
  clearError: () => void;
}

export function useWeChat(): UseWeChatReturn {
  const [isInWeChat, setIsInWeChat] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<WeChatUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查是否在企业微信环境中
  useEffect(() => {
    setIsInWeChat(isInWeChatWork());
  }, []);

  // 初始化SDK
  const initSDK = useCallback(async () => {
    if (!isInWeChat) {
      setError('不在企业微信环境中');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 获取当前页面URL
      const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
      
      // 获取企业微信配置
      const configResponse = await wechatAPI.getConfig(currentUrl);
      
      if (!configResponse.success) {
        throw new Error(configResponse.error || '获取企业微信配置失败');
      }

      const config: WeChatConfig = configResponse.data;
      
      // 配置JS-SDK
      await wechatSDK.configSDK(config);
      
      setIsConfigLoaded(true);
      setIsSDKReady(true);
      
      console.log('企业微信SDK初始化成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SDK初始化失败';
      setError(errorMessage);
      console.error('企业微信SDK初始化失败:', err);
    } finally {
      setLoading(false);
    }
  }, [isInWeChat]);

  // 获取用户信息
  const getUserInfo = useCallback(async (code?: string) => {
    if (!isInWeChat) {
      setError('不在企业微信环境中');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 如果没有提供code，尝试从URL参数获取
      const authCode = code || getUrlParam('code');
      
      if (!authCode) {
        throw new Error('缺少授权码');
      }

      const response = await wechatAPI.getUserInfo(authCode);
      
      if (!response.success) {
        throw new Error(response.error || '获取用户信息失败');
      }

      setUserInfo(response.data);
      console.log('用户信息获取成功:', response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      setError(errorMessage);
      console.error('获取用户信息失败:', err);
    } finally {
      setLoading(false);
    }
  }, [isInWeChat]);

  // 分享到聊天
  const shareToChat = useCallback(async (options: {
    title: string;
    desc: string;
    link: string;
    imgUrl?: string;
  }) => {
    if (!isSDKReady) {
      throw new Error('企业微信SDK未就绪');
    }

    try {
      await wechatSDK.shareToChat(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分享失败';
      setError(errorMessage);
      throw err;
    }
  }, [isSDKReady]);

  // 分享到朋友圈
  const shareToTimeline = useCallback(async (options: {
    title: string;
    link: string;
    imgUrl?: string;
  }) => {
    if (!isSDKReady) {
      throw new Error('企业微信SDK未就绪');
    }

    try {
      await wechatSDK.shareToTimeline(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分享失败';
      setError(errorMessage);
      throw err;
    }
  }, [isSDKReady]);

  // 关闭窗口
  const closeWindow = useCallback(() => {
    if (!isSDKReady) {
      setError('企业微信SDK未就绪');
      return;
    }

    try {
      wechatSDK.closeWindow();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '关闭窗口失败';
      setError(errorMessage);
    }
  }, [isSDKReady]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 自动初始化（如果URL中有code参数）
  useEffect(() => {
    const code = getUrlParam('code');
    if (isInWeChat && code && !userInfo) {
      initSDK().then(() => {
        getUserInfo(code);
      });
    }
  }, [isInWeChat, initSDK, getUserInfo, userInfo]);

  return {
    // 状态
    isInWeChat,
    isSDKReady,
    isConfigLoaded,
    userInfo,
    loading,
    error,

    // 方法
    initSDK,
    getUserInfo,
    shareToChat,
    shareToTimeline,
    closeWindow,
    clearError,
  };
}
