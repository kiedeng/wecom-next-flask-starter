#!/bin/bash

# 企业微信应用部署脚本

set -e

echo "🚀 开始部署企业微信应用..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  环境变量文件不存在，正在创建..."
    cp env.example .env
    echo "📝 请编辑 .env 文件，填入正确的配置信息"
    echo "   特别是企业微信的 CORP_ID、CORP_SECRET、AGENT_ID"
    read -p "按回车键继续..."
fi

# 选择部署模式
echo "请选择部署模式："
echo "1) 开发模式 (使用 docker-compose.dev.yml)"
echo "2) 生产模式 (使用 docker-compose.yml)"
read -p "请输入选择 (1/2): " mode

case $mode in
    1)
        echo "🔧 使用开发模式部署..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml build
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    2)
        echo "🏭 使用生产模式部署..."
        docker-compose down
        docker-compose build
        docker-compose up -d
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查API服务
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ API服务运行正常"
else
    echo "❌ API服务启动失败"
    docker-compose logs api
    exit 1
fi

# 检查前端服务
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "❌ 前端服务启动失败"
    docker-compose logs web
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 服务地址："
echo "   前端应用: http://localhost:3000"
echo "   API服务:  http://localhost:5000"
echo "   健康检查: http://localhost:5000/api/health"
echo ""
echo "📋 常用命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo "   更新服务: docker-compose pull && docker-compose up -d"
echo ""
echo "⚠️  请确保："
echo "   1. 企业微信应用已正确配置"
echo "   2. 可信域名已设置"
echo "   3. 生产环境使用HTTPS"
echo ""
