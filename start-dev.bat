@echo off
echo 启动企业微信应用开发环境...

echo.
echo 1. 启动API服务 (端口5000)
start "API Server" cmd /k "cd api && python app.py"

echo.
echo 2. 启动前端服务 (端口3000)
start "Frontend Server" cmd /k "cd web && npm run dev"

echo.
echo 服务启动中...
echo API服务: http://localhost:5000
echo 前端服务: http://localhost:3000
echo.
echo 按任意键退出...
pause > nul
