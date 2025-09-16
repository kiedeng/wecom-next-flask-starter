# 企业微信应用部署指南

本指南详细说明如何将企业微信应用部署到生产环境。

## 🚀 部署前准备

### 1. 服务器要求

**最低配置：**
- CPU: 1核
- 内存: 1GB
- 存储: 10GB
- 操作系统: Ubuntu 18.04+ / CentOS 7+

**推荐配置：**
- CPU: 2核
- 内存: 2GB
- 存储: 20GB
- 操作系统: Ubuntu 20.04 LTS

### 2. 域名和SSL证书

- 准备一个已备案的域名
- 申请SSL证书（推荐使用Let's Encrypt免费证书）
- 确保域名可以正常解析到服务器

### 3. 企业微信应用配置

确保已完成以下配置：
- ✅ 创建企业微信应用
- ✅ 配置可信域名
- ✅ 设置自定义菜单
- ✅ 获取应用配置信息

## 🐳 Docker部署（推荐）

### 1. 创建Dockerfile

```dockerfile
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# 启动命令
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
```

### 2. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  wechat-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - CORP_ID=${CORP_ID}
      - CORP_SECRET=${CORP_SECRET}
      - AGENT_ID=${AGENT_ID}
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - wechat-app
    restart: unless-stopped
```

### 3. 创建Nginx配置

```nginx
events {
    worker_connections 1024;
}

http {
    upstream wechat_app {
        server wechat-app:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://wechat_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
    }
}
```

### 4. 部署步骤

```bash
# 1. 克隆代码到服务器
git clone <your-repo-url> /opt/wechat-app
cd /opt/wechat-app

# 2. 创建环境变量文件
cp env.example .env
# 编辑 .env 文件，填入实际配置

# 3. 构建和启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

## 🖥️ 传统部署

### 1. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python和pip
sudo apt install python3 python3-pip python3-venv -y

# 安装Nginx
sudo apt install nginx -y

# 安装SSL证书工具
sudo apt install certbot python3-certbot-nginx -y
```

### 2. 部署应用

```bash
# 创建应用目录
sudo mkdir -p /opt/wechat-app
cd /opt/wechat-app

# 克隆代码
sudo git clone <your-repo-url> .

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp env.example .env
# 编辑 .env 文件
```

### 3. 配置Nginx

```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/wechat-app
```

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

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/wechat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 配置SSL证书

```bash
# 申请SSL证书
sudo certbot --nginx -d yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. 创建系统服务

```bash
# 创建systemd服务文件
sudo nano /etc/systemd/system/wechat-app.service
```

```ini
[Unit]
Description=WeChat Work App
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/wechat-app
Environment=PATH=/opt/wechat-app/venv/bin
ExecStart=/opt/wechat-app/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable wechat-app
sudo systemctl start wechat-app
sudo systemctl status wechat-app
```

## 🔧 配置优化

### 1. Gunicorn配置

创建 `gunicorn.conf.py`：

```python
bind = "127.0.0.1:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

### 2. 日志配置

```python
# 在app.py中添加日志配置
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/wechat-app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('WeChat App startup')
```

### 3. 环境变量管理

使用 `python-dotenv` 管理环境变量：

```python
from dotenv import load_dotenv
load_dotenv()
```

## 📊 监控和维护

### 1. 健康检查

创建健康检查端点：

```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0'
    })
```

### 2. 日志监控

```bash
# 查看应用日志
sudo journalctl -u wechat-app -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. 性能监控

安装监控工具：

```bash
# 安装htop
sudo apt install htop -y

# 安装iotop
sudo apt install iotop -y

# 安装netstat
sudo apt install net-tools -y
```

## 🔄 更新部署

### 1. 代码更新

```bash
# 停止服务
sudo systemctl stop wechat-app

# 更新代码
cd /opt/wechat-app
git pull origin main

# 更新依赖
source venv/bin/activate
pip install -r requirements.txt

# 重启服务
sudo systemctl start wechat-app
```

### 2. Docker更新

```bash
# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d

# 清理旧镜像
docker system prune -f
```

## 🚨 故障排除

### 1. 常见问题

**应用无法启动：**
```bash
# 检查配置
python -c "from config import Config; Config.validate_config()"

# 检查端口占用
sudo netstat -tlnp | grep :5000

# 查看错误日志
sudo journalctl -u wechat-app --no-pager
```

**Nginx 502错误：**
```bash
# 检查应用是否运行
sudo systemctl status wechat-app

# 检查Nginx配置
sudo nginx -t

# 检查防火墙
sudo ufw status
```

**SSL证书问题：**
```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew --dry-run
```

### 2. 性能优化

**数据库优化：**
- 使用连接池
- 添加索引
- 定期清理日志

**缓存优化：**
- 使用Redis缓存
- 缓存API响应
- 静态资源CDN

**负载均衡：**
- 多实例部署
- Nginx负载均衡
- 健康检查

## 📋 部署检查清单

- [ ] 服务器环境准备完成
- [ ] 域名解析配置正确
- [ ] SSL证书申请成功
- [ ] 企业微信应用配置完成
- [ ] 环境变量配置正确
- [ ] 应用成功启动
- [ ] Nginx配置正确
- [ ] 防火墙规则配置
- [ ] 监控和日志配置
- [ ] 备份策略制定
- [ ] 更新流程测试
- [ ] 性能测试通过

## 🔐 安全加固

1. **系统安全：**
   - 定期更新系统
   - 配置防火墙
   - 禁用不必要的服务

2. **应用安全：**
   - 使用HTTPS
   - 配置安全头
   - 输入验证

3. **数据安全：**
   - 定期备份
   - 加密存储
   - 访问控制

完成以上步骤后，你的企业微信应用就可以在生产环境中稳定运行了！
