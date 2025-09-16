#!/bin/bash

echo "启动企业微信应用开发环境..."

echo ""
echo "1. 启动API服务 (端口5000)"
cd api && python app.py &
API_PID=$!

echo ""
echo "2. 启动前端服务 (端口3000)"
cd ../web && npm run dev &
FRONTEND_PID=$!

echo ""
echo "服务启动中..."
echo "API服务: http://localhost:5000"
echo "前端服务: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $API_PID $FRONTEND_PID; exit" INT
wait
