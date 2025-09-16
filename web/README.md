# 企业微信应用前端

这是企业微信集成应用的前端部分，基于 Next.js 15 构建，提供现代化的用户界面和完整的企业微信功能集成。

## 🚀 功能特性

- ✅ **企业微信JS-SDK集成** - 完整的企业微信前端功能支持
- ✅ **OAuth2.0用户授权** - 安全的用户身份验证
- ✅ **用户信息获取** - 获取用户基本信息和详细信息
- ✅ **消息分享功能** - 支持分享到企业微信聊天和朋友圈
- ✅ **消息发送功能** - 支持发送文本和Markdown消息
- ✅ **响应式设计** - 适配移动端和桌面端
- ✅ **现代化UI** - 基于Tailwind CSS的美观界面
- ✅ **TypeScript支持** - 完整的类型安全
- ✅ **错误处理** - 完善的错误处理和用户反馈

## 📁 项目结构

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/         # React组件
│   │   ├── ui/            # 基础UI组件
│   │   │   ├── Alert.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── WeChatStatus.tsx    # 企业微信状态组件
│   │   ├── UserInfo.tsx        # 用户信息组件
│   │   ├── SharePanel.tsx      # 分享面板组件
│   │   └── MessageSender.tsx   # 消息发送组件
│   ├── hooks/             # React Hooks
│   │   └── useWeChat.ts   # 企业微信Hook
│   └── lib/               # 工具库
│       ├── api.ts         # API客户端
│       ├── utils.ts       # 工具函数
│       └── wechat.ts      # 企业微信SDK封装
├── public/                # 静态资源
├── package.json          # 依赖配置
├── tailwind.config.js    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── next.config.ts        # Next.js配置
```

## 🛠️ 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js 18+
- npm 或 yarn

### 2. 安装依赖

```bash
cd web
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑 .env.local 文件
```

编辑 `.env.local` 文件：

```env
# API服务地址
NEXT_PUBLIC_API_URL=http://localhost:5000

# 应用配置
NEXT_PUBLIC_APP_NAME=企业微信应用
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 🎨 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **HTTP客户端**: Axios
- **状态管理**: React Hooks

## 📱 功能说明

### 企业微信状态检测
- 自动检测是否在企业微信环境中
- 显示SDK初始化状态
- 提供错误处理和重试机制

### 用户信息管理
- OAuth2.0授权流程
- 获取用户基本信息
- 显示用户详细信息（姓名、手机、邮箱、部门等）

### 消息分享
- 分享到企业微信聊天
- 分享到朋友圈
- 自定义分享内容

### 消息发送
- 发送文本消息
- 发送Markdown消息
- 支持富文本格式

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_API_URL` | API服务地址 | ✅ | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | ❌ | `企业微信应用` |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本 | ❌ | `1.0.0` |

### 企业微信配置

1. **域名要求**：
   - 必须使用HTTPS协议（生产环境）
   - 域名必须已备案
   - 必须完成可信域名验证

2. **应用权限**：
   - 确保应用有相应的API权限
   - 配置正确的回调地址

## 🐛 常见问题

### Q: 企业微信SDK初始化失败？

**A:** 检查以下几点：
- 确认在企业微信环境中打开
- 确认域名已配置为可信域名
- 确认API服务正常运行
- 检查网络连接

### Q: 无法获取用户信息？

**A:** 检查以下几点：
- 确认OAuth授权流程正确
- 确认应用权限配置
- 确认用户在企业微信中
- 检查授权码是否有效

### Q: 分享功能不工作？

**A:** 检查以下几点：
- 确认SDK已正确初始化
- 确认在企业微信环境中
- 检查分享参数是否正确

### Q: 样式显示异常？

**A:** 检查以下几点：
- 确认Tailwind CSS正确配置
- 检查CSS变量是否正确设置
- 确认响应式断点设置

## 🔒 安全注意事项

1. **HTTPS证书**：生产环境必须使用HTTPS
2. **域名白名单**：只允许企业微信访问
3. **敏感信息**：不要在前端暴露敏感配置
4. **数据验证**：对用户输入进行验证
5. **错误处理**：不要暴露敏感错误信息

## 📞 技术支持

如有问题，请参考：
- [Next.js官方文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [企业微信JS-SDK文档](https://developer.work.weixin.qq.com/document/path/90488)
- [TypeScript文档](https://www.typescriptlang.org/docs)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

**注意**：这是一个示例项目，请根据实际需求进行修改和扩展。