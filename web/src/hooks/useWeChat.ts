'use client';

import { useState, useEffect, useCallback } from 'react';
import { wechatAPI } from '@/lib/api';
import { wechatSDK, WeChatConfig, WeChatUserInfo } from '@/lib/wechat';
import { isInWeChatWork, getUrlParam } from '@/lib/utils';

// API响应类型定义
interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

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

  // 检测企业微信环境
  useEffect(() => {
    const checkEnvironment = () => {
      try {
        // 确保在浏览器环境中
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
          console.log('服务端渲染环境，跳过环境检测');
          return;
        }

        const inWeChat = isInWeChatWork();
        const isWeChatBrowser = /micromessenger/i.test(navigator.userAgent);
        
        console.log('企业微信环境检测:', { inWeChat, isWeChatBrowser });
        
        setIsInWeChat(inWeChat);
        setIsWeChat(isWeChatBrowser);
        
        if (!inWeChat && !isWeChatBrowser) {
          setShowWeComRequired(true);
        }
      } catch (err) {
        console.error('环境检测失败:', err);
        setError('环境检测失败');
      }
    };

    // 延迟执行，确保在客户端环境中
    const timer = setTimeout(checkEnvironment, 0);
    return () => clearTimeout(timer);
  }, []);

  // 初始化企业微信SDK
  const initSDK = useCallback(async () => {
    if (isSDKReady) return;

    try {
      setLoading(true);
      setError(null);

      // 获取当前页面URL
      const currentUrl = window.location.href;
      console.log('当前页面URL:', currentUrl);

      // 获取企业微信配置
      const configResponse = (await wechatAPI.getConfig(currentUrl)) as unknown as APIResponse<{
        appId: string;
        timestamp: number;
        nonceStr: string;
        signature: string;
      }>;
      console.log('企业微信配置响应:', configResponse);

      if (configResponse.success && configResponse.data) {
        const config: WeChatConfig = {
          appId: configResponse.data.appId,
          timestamp: configResponse.data.timestamp,
          nonceStr: configResponse.data.nonceStr,
          signature: configResponse.data.signature,
        };

        console.log('企业微信SDK配置:', config);

        // 配置企业微信SDK
        await wechatSDK.configSDK(config);
        setIsSDKReady(true);
        setIsConfigLoaded(true);
        
        console.log('企业微信SDK初始化成功');
      } else {
        throw new Error('获取企业微信配置失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SDK初始化失败';
      console.error('企业微信SDK初始化失败:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isSDKReady]);

  // 获取用户信息
  const getUserInfo = useCallback(async (code?: string) => {
    if (!isSDKReady) {
      throw new Error('企业微信SDK未就绪');
    }

    try {
      setLoading(true);
      setError(null);

      const userInfoResponse = (await wechatAPI.getUserInfo()) as unknown as APIResponse<WeChatUserInfo>;
      console.log('用户信息响应:', userInfoResponse);

      if (userInfoResponse.success && userInfoResponse.data) {
        setUserInfo(userInfoResponse.data);
        console.log('用户信息获取成功:', userInfoResponse.data);
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      console.error('获取用户信息失败:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isSDKReady]);

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
      // 没有code，获取授权URL并跳转
      console.log('没有code参数，获取授权URL并跳转');
      wechatAPI.getOAuthUrl()
        .then((response) => {
          const oauthResponse = response as unknown as APIResponse<{
            oauth_url: string;
            redirect_uri: string;
            state: string;
          }>;
          console.log('获取到授权URL响应:', oauthResponse);
          if (oauthResponse.success && oauthResponse.data.oauth_url) {
            console.log('跳转到企业微信授权页面:', oauthResponse.data.oauth_url);
            window.location.href = oauthResponse.data.oauth_url;
          } else {
            console.error('获取授权URL失败:', oauthResponse);
            setError('获取授权链接失败');
          }
        })
        .catch((error) => {
          console.error('获取授权URL出错:', error);
          setError('获取授权链接失败');
        });
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