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
    this.loadScript();
  }

  // 加载企业微信JS-SDK
  private loadScript(): void {
    if (typeof window === 'undefined') return;
    
    if (window.wx) {
      this.initSDK();
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

  // 初始化SDK
  private initSDK(): void {
    if (typeof window === 'undefined' || !window.wx) {
      console.error('企业微信JS-SDK未加载');
      return;
    }

    // 重写企业微信的错误处理，防止弹窗
    const originalError = window.wx.error;
    window.wx.error = (res: any) => {
      console.error('企业微信JS-SDK错误:', res);
      // 不调用原始错误处理，避免弹窗
      // originalError.call(window.wx, res);
    };

    // 重写alert和confirm，防止弹窗
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    window.alert = (message: string) => {
      console.log('被阻止的alert:', message);
      // 不显示弹窗
    };
    
    window.confirm = (message?: string) => {
      console.log('被阻止的confirm:', message);
      return false; // 默认返回false
    };

    window.wx.ready(() => {
      this.isReady = true;
      console.log('企业微信JS-SDK初始化成功');
    });
  }

  // 配置JS-SDK
  async configSDK(config: WeChatConfig): Promise<void> {
    if (typeof window === 'undefined' || !window.wx) {
      throw new Error('企业微信JS-SDK未加载');
    }

    this.config = config;

    return new Promise((resolve, reject) => {
      console.log('企业微信SDK配置:', config); // 调试日志
      
      window.wx.config({
        beta: true,
        debug: false, // 禁用调试模式，避免弹窗
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'closeWindow',
          'scanQRCode',
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'getLocation',
          'openLocation',
          'getNetworkType',
          'openUrl',
          'getLocalImgData',
          'localImageToBase64',
          'startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'playVoice',
          'pauseVoice',
          'stopVoice',
          'onVoicePlayEnd',
          'uploadVoice',
          'downloadVoice',
          'translateVoice',
          'onHistoryBack',
          'testSpeed',
          'getContext',
          'postMessage',
          'log',
          'setStorage',
          'getStorage',
          'removeStorage',
          'clearStorage',
          'getStorageInfo',
          'startMonitoringBeacons',
          'stopMonitoringBeacons',
          'onBeaconsInRange',
          'offBeaconsInRange',
          'checkJsApi',
          'onMenuShareWechat',
          'onMenuShareWechatWork',
          'onMenuShareWechatWorkTimeline',
          'onMenuShareWechatWorkAppMessage',
          'onMenuShareWechatWorkQQ',
          'onMenuShareWechatWorkWeibo',
          'onMenuShareWechatWorkQZone'
        ]
      });

      window.wx.ready(() => {
        console.log('企业微信SDK配置成功');
        resolve();
      });

      window.wx.error((res: any) => {
        console.error('企业微信SDK配置失败:', res);
        // 不直接reject，而是静默处理错误，避免弹窗
        // 可以通过其他方式通知用户
        reject(new Error(`JS-SDK配置失败: ${res.errMsg}`));
      });
    });
  }

  // 分享到聊天
  shareToChat(options: {
    title: string;
    desc: string;
    link: string;
    imgUrl?: string;
  }): Promise<void> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }

    return new Promise((resolve, reject) => {
      window.wx.onMenuShareAppMessage({
        title: options.title,
        desc: options.desc,
        link: options.link,
        imgUrl: options.imgUrl || '',
        success: () => {
          resolve();
        },
        cancel: () => {
          reject(new Error('用户取消分享'));
        }
      });
    });
  }

  // 分享到朋友圈
  shareToTimeline(options: {
    title: string;
    link: string;
    imgUrl?: string;
  }): Promise<void> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }

    return new Promise((resolve, reject) => {
      window.wx.onMenuShareTimeline({
        title: options.title,
        link: options.link,
        imgUrl: options.imgUrl || '',
        success: () => {
          resolve();
        },
        cancel: () => {
          reject(new Error('用户取消分享'));
        }
      });
    });
  }

  // 关闭当前窗口
  closeWindow(): void {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }
    window.wx.closeWindow();
  }

  // 获取网络状态
  getNetworkType(): Promise<string> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }

    return new Promise((resolve, reject) => {
      window.wx.getNetworkType({
        success: (res: any) => {
          resolve(res.networkType);
        },
        fail: (res: any) => {
          reject(new Error(res.errMsg));
        }
      });
    });
  }

  // 检查API是否可用
  checkJsApi(api: string): Promise<boolean> {
    if (!this.isReady) {
      throw new Error('企业微信JS-SDK未就绪');
    }

    return new Promise((resolve, reject) => {
      window.wx.checkJsApi({
        jsApiList: [api],
        success: (res: any) => {
          resolve(res.checkResult[api]);
        },
        fail: (res: any) => {
          reject(new Error(res.errMsg));
        }
      });
    });
  }
}

// 创建全局实例
export const wechatSDK = new WeChatWorkSDK();
