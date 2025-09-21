// 企业微信JS-SDK类型定义
declare global {
  interface Window {
    wx: any;
  }
}

export interface WeChatConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}

export interface WeChatUserInfo {
  UserId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string[];
  position?: string;
  avatar?: string;
}

// 企业微信JS-SDK封装类
export class WeChatWorkSDK {
  private config: WeChatConfig | null = null;
  private isReady = false;

  constructor() {
    // 只在客户端环境加载脚本
    if (typeof window !== 'undefined') {
      this.loadScript();
    }
  }

  // 加载企业微信JS-SDK
  private loadScript(): void {
    if (typeof window === 'undefined') return;
    
    // 检查是否已经加载过
    if (window.wx) {
      this.initSDK();
      return;
    }

    // 检查是否已经有脚本标签
    const existingScript = document.querySelector('script[src*="jweixin-1.2.0.js"]');
    if (existingScript) {
      // 如果已经有脚本标签，等待加载完成
      existingScript.addEventListener('load', () => {
        this.initSDK();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js';
    script.onload = () => {
      this.initSDK();
    };
    script.onerror = () => {
      console.error('企业微信JS-SDK加载失败');
    };
    document.head.appendChild(script);
  }

  private initSDK(): void {
    if (typeof window === 'undefined' || !window.wx) {
      console.error('企业微信JS-SDK未加载');
      return;
    }

    const originalError = window.wx.error;
    window.wx.error = (res: any) => {
      console.error('企业微信JS-SDK错误:', res);
    };

    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    window.alert = (message: string) => {
      console.log('被阻止的alert:', message);
    };

    window.confirm = (message?: string) => {
      console.log('被阻止的confirm:', message);
      return false;
    };

    window.wx.ready(() => {
      this.isReady = true;
      console.log('企业微信JS-SDK初始化成功');
    });
  }

  async configSDK(config: WeChatConfig): Promise<void> {
    if (typeof window === 'undefined' || !window.wx) {
      throw new Error('企业微信JS-SDK未加载');
    }

    this.config = config;

    return new Promise((resolve, reject) => {
      console.log('企业微信SDK配置:', config);

      window.wx.config({
        beta: true,
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone',
          'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow',
          'scanQRCode', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getLocation',
          'openLocation', 'getNetworkType', 'openUrl', 'getLocalImgData', 'localImageToBase64', 'startRecord',
          'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd',
          'uploadVoice', 'downloadVoice', 'translateVoice', 'onHistoryBack', 'testSpeed', 'getContext',
          'postMessage', 'log', 'setStorage', 'getStorage', 'removeStorage', 'clearStorage', 'getStorageInfo',
          'startMonitoringBeacons', 'stopMonitoringBeacons', 'onBeaconsInRange', 'offBeaconsInRange',
          'checkJsApi', 'onMenuShareWechat', 'onMenuShareWechatWork', 'onMenuShareWechatWorkTimeline',
          'onMenuShareWechatWorkAppMessage', 'onMenuShareWechatWorkQQ', 'onMenuShareWechatWorkWeibo',
          'onMenuShareWechatWorkQZone'
        ]
      });

      window.wx.ready(() => {
        console.log('企业微信SDK配置成功');
        resolve();
      });

      window.wx.error((res: any) => {
        console.error('企业微信SDK配置失败:', res);
        reject(new Error(`JS-SDK配置失败: ${res.errMsg}`));
      });
    });
  }

  shareToChat(options: { title: string; desc: string; link: string; imgUrl?: string; }): Promise<void> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    return new Promise((resolve, reject) => {
      window.wx.onMenuShareAppMessage({
        title: options.title, desc: options.desc, link: options.link, imgUrl: options.imgUrl || '',
        success: () => { resolve(); }, cancel: () => { reject(new Error('用户取消分享')); }
      });
    });
  }

  shareToTimeline(options: { title: string; link: string; imgUrl?: string; }): Promise<void> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    return new Promise((resolve, reject) => {
      window.wx.onMenuShareTimeline({
        title: options.title, link: options.link, imgUrl: options.imgUrl || '',
        success: () => { resolve(); }, cancel: () => { reject(new Error('用户取消分享')); }
      });
    });
  }

  closeWindow(): void {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    window.wx.closeWindow();
  }

  getNetworkType(): Promise<string> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    return new Promise((resolve, reject) => {
      window.wx.getNetworkType({
        success: (res: any) => { resolve(res.networkType); }, fail: (res: any) => { reject(new Error(res.errMsg)); }
      });
    });
  }

  checkJsApi(api: string): Promise<boolean> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    return new Promise((resolve, reject) => {
      window.wx.checkJsApi({
        jsApiList: [api],
        success: (res: any) => { resolve(res.checkResult[api]); }, fail: (res: any) => { reject(new Error(res.errMsg)); }
      });
    });
  }
}

export const wechatSDK = new WeChatWorkSDK();