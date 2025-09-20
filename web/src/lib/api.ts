import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 企业微信相关API
export const wechatAPI = {
  // 获取企业微信JS-SDK配置
  getConfig: (url?: string) => {
    const params = url ? { url } : {};
    return api.get('/api/wechat/config', { params });
  },

  // 获取OAuth授权URL
  getOAuthUrl: (redirectUri?: string, state?: string) => {
    const params: any = {};
    if (redirectUri) params.redirect_uri = redirectUri;
    if (state) params.state = state;
    return api.get('/api/oauth/url', { params });
  },

  // 获取用户信息
  getUserInfo: (code: string) => {
    return api.get('/api/user/info', { params: { code } });
  },

  // 发送消息
  sendMessage: (data: {
    userid: string;
    type: 'text' | 'markdown';
    content: string;
  }) => {
    return api.post('/api/send/message', data);
  },

  // 健康检查
  healthCheck: () => {
    return api.get('/api/health');
  },
};

export default api;
