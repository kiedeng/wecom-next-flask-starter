# 企业微信应用集成项目

这是一个完整的企业微信应用集成示例，包含前端和后端实现，支持用户授权、信息获取、消息分享等功能。

## 🚀 功能特性

- ✅ **企业微信JS-SDK集成** - 完整的企业微信前端功能支持
- ✅ **OAuth2.0用户授权** - 安全的用户身份验证
- ✅ **用户信息获取** - 获取用户基本信息和详细信息
- ✅ **消息分享功能** - 支持分享到企业微信聊天
- ✅ **签名生成和验证** - 自动处理企业微信签名算法
- ✅ **响应式前端界面** - 适配移动端和桌面端
- ✅ **多页面支持** - 首页、工作台、个人中心等
- ✅ **调试和日志** - 完整的调试信息记录
- ✅ **错误处理** - 完善的错误处理机制

## 📁 项目结构

```
bigdata_tool/
├── api/                   # 后端API服务
│   ├── app.py            # Flask主应用
│   ├── config.py         # 配置管理
│   ├── run.py            # 启动脚本
│   ├── requirements.txt  # Python依赖
│   ├── env.example       # 环境变量示例
│   └── README.md         # API文档
├── web/                   # 前端Next.js应用
│   ├── src/              # 源代码
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React组件
│   │   ├── hooks/        # React Hooks
│   │   └── lib/          # 工具库
│   ├── package.json      # 前端依赖
│   ├── env.example       # 前端环境变量
│   └── README.md         # 前端文档
├── start-dev.bat         # Windows启动脚本
└── start-dev.sh          # Linux/Mac启动脚本
```

## 🛠️ 快速开始

### 1. 环境准备

确保你的系统已安装：
- Python 3.7+
- pip

### 2. 安装依赖

```bash
# 克隆或下载项目
cd bigdata_tool

# 安装后端依赖
cd api
pip install -r requirements.txt

# 安装前端依赖
cd ../web
npm install
```

### 3. 配置企业微信应用

#### 3.1 创建企业微信应用

1. 登录[企业微信管理后台](https://work.weixin.qq.com/)
2. 进入"应用管理" → "自建" → "创建应用"
3. 填写应用信息：
   - 应用名称：你的应用名称
   - 应用介绍：应用功能描述
   - 应用logo：上传应用图标
4. 创建完成后，记录以下信息：
   - **AgentId**: 应用ID
   - **Secret**: 应用密钥
   - **CorpId**: 企业ID（在"我的企业"页面查看）

#### 3.2 配置可信域名

1. 进入应用设置 → "开发者接口"
2. 找到"网页授权及JS-SDK"
3. 点击"设置可信域名"
4. 添加你的公网域名（如：yourdomain.com）
5. 下载验证文件并上传到网站根目录
6. 点击"验证"完成域名验证

#### 3.3 配置自定义菜单

1. 进入应用管理 → 你的应用 → "自定义菜单"
2. 点击"添加菜单"
3. 配置菜单项：
   ```
   菜单名称: 我的应用
   菜单类型: 网页
   网页地址: https://yourdomain.com
   ```
4. 保存配置

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，填入你的配置
```

编辑 `.env` 文件：

```env
# 企业微信配置
CORP_ID=ww1234567890abcdef
CORP_SECRET=your_corp_secret_here
AGENT_ID=1000001

# 应用配置
DEBUG=True
HOST=0.0.0.0
PORT=5000
SECRET_KEY=your_secret_key_here
```

### 5. 运行应用

#### 方式一：使用启动脚本（推荐）

**Windows:**
```bash
# 在项目根目录运行
start-dev.bat
```

**Linux/Mac:**
```bash
# 在项目根目录运行
chmod +x start-dev.sh
./start-dev.sh
```

#### 方式二：手动启动

**启动后端API服务:**
```bash
cd api
python app.py
```

**启动前端服务:**
```bash
cd web
npm run dev
```

- API服务将在 `http://localhost:5000` 启动
- 前端服务将在 `http://localhost:3000` 启动

### 6. 测试应用

1. 在企业微信中打开应用
2. 点击自定义菜单
3. 验证是否能正常跳转到你的网站
4. 测试各项功能是否正常：
   - 用户授权和信息获取
   - 消息分享功能
   - 消息发送功能
   - 响应式界面适配

## 🌐 部署到生产环境

### 使用Gunicorn部署

```bash
# 安装Gunicorn
pip install gunicorn

# 启动应用
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 使用Docker部署

创建 `Dockerfile`：

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

构建和运行：

```bash
# 构建镜像
docker build -t wechat-app .

# 运行容器
docker run -p 5000:5000 --env-file .env wechat-app
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📚 API接口文档

### 获取企业微信配置

**GET** `/api/wechat/config`

获取企业微信JS-SDK签名配置。

**参数：**
- `url` (可选): 当前页面URL

**响应：**
```json
{
  "success": true,
  "data": {
    "appId": "企业ID",
    "timestamp": "时间戳",
    "nonceStr": "随机字符串",
    "signature": "签名"
  }
}
```

### 获取用户信息

**GET** `/api/user/info`

通过OAuth授权码获取用户信息。

**参数：**
- `code`: OAuth授权码

**响应：**
```json
{
  "success": true,
  "data": {
    "UserId": "用户ID",
    "name": "用户姓名",
    "mobile": "手机号",
    "email": "邮箱",
    "department": ["部门1", "部门2"],
    "position": "职位"
  }
}
```

### 发送消息

**POST** `/api/send/message`

发送消息到企业微信。

**请求体：**
```json
{
  "type": "text",
  "content": "消息内容"
}
```

**响应：**
```json
{
  "success": true,
  "message": "消息发送成功"
}
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| `CORP_ID` | 企业ID | ✅ | `ww1234567890abcdef` |
| `CORP_SECRET` | 应用Secret | ✅ | `your_secret_here` |
| `AGENT_ID` | 应用ID | ✅ | `1000001` |
| `DEBUG` | 调试模式 | ❌ | `True` |
| `HOST` | 监听地址 | ❌ | `0.0.0.0` |
| `PORT` | 监听端口 | ❌ | `5000` |
| `SECRET_KEY` | Flask密钥 | ❌ | `your_secret_key` |

### 企业微信配置要求

1. **域名要求**：
   - 必须使用HTTPS协议（生产环境）
   - 域名必须已备案
   - 必须完成可信域名验证

2. **应用权限**：
   - 确保应用有相应的API权限
   - 配置正确的回调地址

## 🐛 常见问题

### Q: 签名验证失败怎么办？

**A:** 检查以下几点：
- 确认URL参数正确（不包含#号及后面的内容）
- 确认时间戳在有效期内
- 确认jsapi_ticket有效
- 确认签名算法实现正确

### Q: 无法获取用户信息？

**A:** 检查以下几点：
- 确认OAuth授权流程正确
- 确认应用权限配置
- 确认用户在企业微信中

### Q: JS-SDK初始化失败？

**A:** 检查以下几点：
- 确认在企业微信环境中打开
- 确认域名已配置为可信域名
- 确认签名配置正确

### Q: 部署后无法访问？

**A:** 检查以下几点：
- 确认服务器防火墙设置
- 确认域名解析正确
- 确认HTTPS证书有效
- 确认企业微信可信域名配置

## 🔒 安全注意事项

1. **HTTPS证书**：生产环境必须使用HTTPS
2. **域名白名单**：只允许企业微信访问
3. **敏感信息**：妥善保管企业微信的Secret等敏感信息
4. **数据加密**：敏感数据传输加密
5. **访问控制**：实现适当的访问控制机制

## 📞 技术支持

如有问题，请参考：
- [企业微信开发文档](https://developer.work.weixin.qq.com/)
- [企业微信JS-SDK文档](https://developer.work.weixin.qq.com/document/path/90488)
- [Flask官方文档](https://flask.palletsprojects.com/)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

**注意**：这是一个示例项目，请根据实际需求进行修改和扩展。
