'use client';

import { useState, useEffect, useCallback } from 'react';
import { wechatAPI } from '@/lib/api';
import { wechatSDK, WeChatConfig, WeChatUserInfo } from '@/lib/wechat';
import { isInWeChatWork, getUrlParam } from '@/lib/utils';

export interface UseWeChatReturn {
  // 状态
  isInWeChat: boolean;
  isWeChat: boolean;
  isSDKReady: boolean;
  isConfigLoaded: boolean;
  userInfo: WeChatUserInfo | null;
  loading: boolean;
  error: string | null;
  showWeComRequired: boolean;
  authCode: string | null;

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
  setAuthCode: (code: string) => void;
  setShowWeComRequired: (show: boolean) => void;
}

export function useWeChat(): UseWeChatReturn {
  const [isInWeChat, setIsInWeChat] = useState(false);
  const [isWeChat, setIsWeChat] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<WeChatUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWeComRequired, setShowWeComRequired] = useState(false);
  const [authCode, setAuthCode] = useState<string | null>(null);

  // 检查客户端类型
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isWeComClient = ua.indexOf('wxwork') !== -1;
    const isWeChatClient = ua.indexOf('micromessenger') !== -1;
    
    setIsInWeChat(isWeComClient);
    setIsWeChat(isWeChatClient);
    
    // 如果不在企业微信中，显示提示页面
    if (!isWeComClient) {
      setShowWeComRequired(true);
    }
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
      let currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
      
      // 调试信息 - 同时显示在控制台和页面上
      const debugInfo = {
        '当前页面完整URL': window.location.href,
        '处理后用于签名的URL': currentUrl,
        'URL参数': Object.fromEntries(new URLSearchParams(window.location.search)),
        '页面路径': window.location.pathname,
        '页面查询参数': window.location.search,
        '页面hash': window.location.hash
      };
      
      console.log('=== 前端URL调试信息 ===');
      console.log('当前页面完整URL:', window.location.href);
      console.log('处理后用于签名的URL:', currentUrl);
      console.log('URL参数:', new URLSearchParams(window.location.search));
      console.log('页面路径:', window.location.pathname);
      console.log('页面查询参数:', window.location.search);
      console.log('页面hash:', window.location.hash);
      
      // 将调试信息存储到全局变量，方便在页面上显示
      (window as any).wechatDebugInfo = debugInfo;
      
      // 确保URL格式正确
      try {
        const urlObj = new URL(currentUrl);
        // 移除不必要的参数，只保留必要的查询参数
        const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        console.log('清理后的URL:', cleanUrl);
        currentUrl = cleanUrl;
      } catch (e) {
        console.warn('URL解析失败，使用原始URL:', e);
      }
      
      console.log('最终发送给后端的URL:', currentUrl);
      console.log('=== 前端调试信息结束 ===');
      
      // 获取企业微信配置
      const configResponse = await wechatAPI.getConfig(currentUrl);
      
      if (!(configResponse as any).success) {
        throw new Error((configResponse as any).error || '获取企业微信配置失败');
      }

      const config: WeChatConfig = configResponse.data;
      
      // 配置JS-SDK
      await wechatSDK.configSDK(config);
      
      setIsConfigLoaded(true);
      setIsSDKReady(true);
      
      console.log('企业微信SDK初始化成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SDK初始化失败';
      console.error('企业微信SDK初始化失败:', err);
      
      // 静默处理错误，不显示错误状态，让应用继续运行
      // setError(errorMessage);
      
      // 设置一个静默失败状态，但不阻止应用运行
      setIsConfigLoaded(false);
      setIsSDKReady(false);
    } finally {
      setLoading(false);
    }
  }, [isInWeChat]);

  // 获取用户信息
  const getUserInfo = useCallback(async () => {
    if (!isInWeChat) {
      setError('不在企业微信环境中');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 不再需要传递code参数，API会自动从请求头获取
      const response = await wechatAPI.getUserInfo();
      
      if (!(response as any).success) {
        throw new Error((response as any).error || '获取用户信息失败');
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

  // 自动授权流程
  useEffect(() => {
    if (!isInWeChat) return;
    
    const code = getUrlParam('code');
    console.log('检查URL中的code参数:', code);
    
    if (code) {
      // 有code，设置授权码并获取用户信息
      setAuthCode(code);
      console.log('发现code参数，开始初始化SDK并获取用户信息');
      initSDK().then(() => {
        getUserInfo();
      });
    } else {
      // 没有code，自动跳转到授权页面
      console.log('没有code参数，自动跳转到授权页面');
      window.location.href = '/api/oauth/url';
    }
  }, [isInWeChat, initSDK, getUserInfo]);

  return {
    // 状态
    isInWeChat,
    isWeChat,
    isSDKReady,
    isConfigLoaded,
    userInfo,
    loading,
    error,
    showWeComRequired,
    authCode,

    // 方法
    initSDK,
    getUserInfo,
    shareToChat,
    shareToTimeline,
    closeWindow,
    clearError,
    setAuthCode,
    setShowWeComRequired,
  };
}
